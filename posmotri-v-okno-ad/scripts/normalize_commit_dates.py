#!/usr/bin/env python3
"""Rewrite the current branch's linear history with spaced commit dates."""

from __future__ import annotations

import os
import random
import subprocess
import sys
from datetime import date, datetime, time, timedelta, timezone
from typing import NoReturn

START_DATE = date(2026, 11, 9)
WORKDAY_START = time(10, 0)
WORKDAY_END = time(19, 0)
MIN_STEP = 15
MAX_STEP = 30


def git(*args: str, check: bool = True, **kwargs) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["git", *args], check=check, stdout=subprocess.PIPE, stderr=subprocess.PIPE, **kwargs
    )


def fail(message: str) -> NoReturn:
    raise SystemExit(message)


def main() -> None:
    if len(sys.argv) > 2 or (len(sys.argv) == 2 and sys.argv[1] != "--yes"):
        fail(f"Usage: {sys.argv[0]} [--yes]")

    branch = git("symbolic-ref", "--quiet", "--short", "HEAD", check=False)
    if branch.returncode:
        fail("Refusing to rewrite a detached HEAD; check out a local branch first.")
    branch_name = branch.stdout.decode().strip()
    status = git("status", "--porcelain").stdout
    if status:
        fail("Working tree is not clean. Commit or stash changes before rewriting history.")

    original_head = git("rev-parse", "HEAD", check=False)
    if original_head.returncode:
        fail("The current branch has no commits to rewrite.")
    original_head = original_head.stdout.decode().strip()
    commits = git("rev-list", "--reverse", "--first-parent", original_head).stdout.decode().splitlines()
    if not commits:
        fail("The current branch has no commits to rewrite.")

    # This utility is deliberately limited to a simple, linear history.
    for commit in commits:
        parents = git("rev-list", "--parents", "-n", "1", commit).stdout.decode().split()
        if len(parents) > 2:
            fail(f"Merge commit {commit[:12]} found; refusing to flatten merge history.")
        body = git("cat-file", "commit", commit).stdout
        headers = body.split(b"\n\n", 1)[0]
        if b"gpgsig " in headers or b"gpgsig-sha256 " in headers:
            fail(f"Signed commit {commit[:12]} found; rewriting would invalidate its signature.")

    intervals = [random.randint(MIN_STEP, MAX_STEP) for _ in range(len(commits) - 1)]
    total_minutes = sum(intervals)
    workday_minutes = int(
        (datetime.combine(START_DATE, WORKDAY_END) - datetime.combine(START_DATE, WORKDAY_START)).total_seconds()
        // 60
    )
    if total_minutes > workday_minutes:
        fail("The randomized intervals do not fit in one 10:00–19:00 workday; run again.")

    latest_start = datetime.combine(START_DATE, WORKDAY_END) - timedelta(minutes=total_minutes)
    earliest_start = datetime.combine(START_DATE, WORKDAY_START)
    start_minute = random.randint(0, int((latest_start - earliest_start).total_seconds() // 60))
    current_date = earliest_start + timedelta(minutes=start_minute)
    dates = [current_date]
    for interval in intervals:
        current_date += timedelta(minutes=interval)
        dates.append(current_date)

    print(f"Will rewrite {len(commits)} commits on {branch_name}.")
    print("A backup ref will be created; dates will be UTC on 2026-11-09, 10:00–19:00.")
    if len(sys.argv) != 2 and input("Rewrite history? Type 'rewrite' to continue: ").strip() != "rewrite":
        fail("Cancelled.")

    backup_ref = f"refs/backup/date-normalization-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')}"
    git("update-ref", backup_ref, original_head)
    rewritten_parent: str | None = None

    for original, commit_date in zip(commits, dates):
        tree = git("show", "-s", "--format=%T", original).stdout.decode().strip()
        author = git("show", "-s", "--format=%an%x00%ae", original).stdout.decode().rstrip("\n").split("\x00", 1)
        committer = git("show", "-s", "--format=%cn%x00%ce", original).stdout.decode().rstrip("\n").split("\x00", 1)
        if len(author) != 2 or len(committer) != 2:
            fail(f"Could not read author/committer identity for {original[:12]}.")
        message = git("cat-file", "commit", original).stdout.split(b"\n\n", 1)[1]
        date_string = commit_date.replace(tzinfo=timezone.utc).strftime("%Y-%m-%dT%H:%M:%S +0000")
        env = os.environ.copy()
        env.update({
            "GIT_AUTHOR_NAME": author[0],
            "GIT_AUTHOR_EMAIL": author[1],
            "GIT_AUTHOR_DATE": date_string,
            "GIT_COMMITTER_NAME": committer[0],
            "GIT_COMMITTER_EMAIL": committer[1],
            "GIT_COMMITTER_DATE": date_string,
        })
        args = ["commit-tree", tree]
        if rewritten_parent:
            args.extend(["-p", rewritten_parent])
        new_commit = git(*args, input=message, env=env).stdout.decode().strip()
        if not new_commit:
            fail(f"Failed to rewrite commit {original[:12]}.")
        print(f"{original[:12]} -> {new_commit[:12]}  {date_string}")
        rewritten_parent = new_commit

    if rewritten_parent is None:
        fail("No commits were rewritten.")
    git("update-ref", f"refs/heads/{branch_name}", rewritten_parent, original_head)
    print(f"Updated {branch_name}. Backup retained at {backup_ref}.")


if __name__ == "__main__":
    main()
