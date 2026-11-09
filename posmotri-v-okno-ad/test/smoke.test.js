import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('document declares Russian content and a meaningful title', () => {
  assert.match(html, /<html lang="ru">/);
  assert.match(html, /<title>Посмотри в окно<\/title>/);
});

test('document includes the main video, search form, and card list', () => {
  assert.match(html, /class="result__video"/);
  assert.match(html, /class="search-form"/);
  assert.match(html, /class="content__list"/);
});

test('dynamic content has accessible status and error announcements', () => {
  assert.match(html, /aria-live="polite" aria-busy="false"/);
  assert.match(html, /class="error" role="alert"/);
  assert.match(html, /<script type="module" src="\.\/scripts\/script\.js"><\/script>/);
});
