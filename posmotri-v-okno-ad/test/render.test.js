import assert from 'node:assert/strict';
import test from 'node:test';
import { renderVideoCard, setMainVideo } from '../scripts/render.js';

function makeTemplate() {
  const elements = {
    '.content__card-link': { dataset: {} },
    '.content__video-card-title': {},
    '.content__video-card-description': {},
    '.content__video-card-thumbnail': {},
  };
  return {
    elements,
    content: {
      cloneNode: () => ({ querySelector: (selector) => elements[selector] }),
    },
  };
}

test('renders card text as text and resolves media URLs', () => {
  const template = makeTemplate();
  renderVideoCard({
    id: 7,
    city: '<script>alert(1)</script>',
    description: 'A window view',
    thumbnail: { url: '/images/7.jpg' },
  }, template, 'https://example.test');

  assert.equal(template.elements['.content__card-link'].dataset.videoId, '7');
  assert.equal(template.elements['.content__video-card-title'].textContent, '<script>alert(1)</script>');
  assert.equal(template.elements['.content__video-card-thumbnail'].src, 'https://example.test/images/7.jpg');
  assert.equal(template.elements['.content__video-card-thumbnail'].loading, 'lazy');
});

test('updates the main video and its poster together', () => {
  const element = {};
  setMainVideo(element, { video: { url: '/video.mp4' }, poster: { url: '/poster.jpg' } }, 'https://example.test');

  assert.equal(element.src, 'https://example.test/video.mp4');
  assert.equal(element.poster, 'https://example.test/poster.jpg');
});
