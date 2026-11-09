import assert from 'node:assert/strict';
import test from 'node:test';
import { renderVideoCard, renderVideoCards, setCurrentCard, setMainVideo } from '../scripts/render.js';

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

test('appends every result card to the list in one fragment', () => {
  const previousDocument = globalThis.document;
  globalThis.document = {
    createDocumentFragment() {
      return { children: [], append(child) { this.children.push(child); } };
    },
  };
  const template = makeTemplate();
  const list = { children: [], append(fragment) { this.children.push(...fragment.children); } };
  const videos = [1, 2].map((id) => ({
    id,
    city: `Город ${id}`,
    thumbnail: { url: `/image-${id}.jpg` },
  }));

  try {
    renderVideoCards(videos, template, list, 'https://example.test');
    assert.equal(list.children.length, 2);
  } finally {
    globalThis.document = previousDocument;
  }
});

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

test('keeps one card current and exposes the state accessibly', () => {
  const cards = ['one', 'two'].map(() => ({
    attributes: {},
    classes: new Set(),
    classList: { toggle(name, enabled) { enabled ? this.owner.classes.add(name) : this.owner.classes.delete(name); } },
    setAttribute(name, value) { this.attributes[name] = value; },
    removeAttribute(name) { delete this.attributes[name]; },
  }));
  cards.forEach((card) => { card.classList.owner = card; });

  setCurrentCard(cards, cards[1]);

  assert.equal(cards[0].classes.has('content__card-link_current'), false);
  assert.equal(cards[1].classes.has('content__card-link_current'), true);
  assert.equal(cards[1].attributes['aria-current'], 'true');
  assert.equal(cards[0].attributes['aria-current'], undefined);
});

test('updates the main video and its poster together', () => {
  const element = {};
  setMainVideo(element, { video: { url: '/video.mp4' }, poster: { url: '/poster.jpg' } }, 'https://example.test');

  assert.equal(element.src, 'https://example.test/video.mp4');
  assert.equal(element.poster, 'https://example.test/poster.jpg');
});
