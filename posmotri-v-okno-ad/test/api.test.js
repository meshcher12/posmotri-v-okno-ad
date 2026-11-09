import assert from 'node:assert/strict';
import test from 'node:test';
import { buildVideosUrl, fetchVideos, hasNextPage, normalizeVideosResponse, readSearchFilters } from '../scripts/api.js';

test('reads the optional city and multiple time filters from form data', () => {
  const formData = new FormData();
  formData.append('city', '  Псков  ');
  formData.append('time', 'morning');
  formData.append('time', 'night');

  assert.deepEqual(readSearchFilters(formData), { city: 'Псков', timeSlots: ['morning', 'night'] });
});

test('builds the default first-page API URL', () => {
  const url = buildVideosUrl();

  assert.equal(url.origin, 'https://v-content.practicum-team.ru');
  assert.equal(url.pathname, '/api/videos');
  assert.equal(url.searchParams.get('pagination[pageSize]'), '5');
  assert.equal(url.searchParams.get('pagination[page]'), '1');
});

test('returns normalized videos and pagination for a successful response', async () => {
  const video = { id: 1, city: 'Москва', video: { url: '/v.mp4' }, poster: { url: '/p.jpg' } };
  const payload = { results: [video], pagination: { page: 2, pageCount: 3 } };
  const result = await fetchVideos('https://example.test/videos', async () => ({
    ok: true,
    json: async () => payload,
  }));

  assert.deepEqual(result, { videos: [video], page: 2, pageCount: 3 });
});

test('detects whether another result page is available', () => {
  assert.equal(hasNextPage({ page: 1, pageCount: 2 }), true);
  assert.equal(hasNextPage({ page: 2, pageCount: 2 }), false);
});

test('rejects malformed payloads and filters incomplete video entries', () => {
  assert.throws(() => normalizeVideosResponse({ results: [] }), /invalid response/);
  const result = normalizeVideosResponse({
    results: [{ id: 1 }, { id: 2, city: 'Казань', video: { url: '/v' }, poster: { url: '/p' } }],
    pagination: {},
  });
  assert.equal(result.videos.length, 1);
  assert.equal(result.videos[0].id, 2);
});

test('throws an actionable error for an unsuccessful response', async () => {
  await assert.rejects(
    fetchVideos('https://example.test/videos', async () => ({ ok: false, status: 503 })),
    /status 503/
  );
});

test('encodes city and appends each selected time slot', () => {
  const url = buildVideosUrl({ city: ' Санкт-Петербург ', timeSlots: ['morning', 'night'] });

  assert.equal(url.searchParams.get('filters[city][$containsi]'), 'Санкт-Петербург');
  assert.deepEqual(url.searchParams.getAll('filters[time_of_day][$eqi]'), ['morning', 'night']);
  assert.match(url.href, /%5B/);
});
