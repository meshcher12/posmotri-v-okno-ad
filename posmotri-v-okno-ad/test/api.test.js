import assert from 'node:assert/strict';
import test from 'node:test';
import { buildVideosUrl } from '../scripts/api.js';

test('builds the default first-page API URL', () => {
  const url = buildVideosUrl();

  assert.equal(url.origin, 'https://v-content.practicum-team.ru');
  assert.equal(url.pathname, '/api/videos');
  assert.equal(url.searchParams.get('pagination[pageSize]'), '5');
  assert.equal(url.searchParams.get('pagination[page]'), '1');
});

test('encodes city and appends each selected time slot', () => {
  const url = buildVideosUrl({ city: ' Санкт-Петербург ', timeSlots: ['morning', 'night'] });

  assert.equal(url.searchParams.get('filters[city][$containsi]'), 'Санкт-Петербург');
  assert.deepEqual(url.searchParams.getAll('filters[time_of_day][$eqi]'), ['morning', 'night']);
  assert.match(url.href, /%5B/);
});
