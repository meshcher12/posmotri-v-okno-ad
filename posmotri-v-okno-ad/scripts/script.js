import {
  API_BASE_URL,
  buildVideosUrl,
  createRequestGate,
  fetchVideos,
  hasNextPage,
  readSearchFilters,
} from './api.js';
import { renderVideoCards, setCurrentCard, setMainVideo } from './render.js';

const MIN_PRELOADER_TIME = 1200;
const cardsList = document.querySelector('.content__list');
const cardsContainer = document.querySelector('.content__list-container');
const videoContainer = document.querySelector('.result__video-container');
const videoElement = document.querySelector('.result__video');
const form = document.querySelector('.search-form');
const cardTemplate = document.querySelector('.cards-list-item-template');
const preloaderTemplate = document.querySelector('.preloader-template');
const errorTemplate = document.querySelector('.error-template');
const moreButtonTemplate = document.querySelector('.more-button-template');
const requestGate = createRequestGate();

let activeFilters = { city: '', timeSlots: [] };
let activeVideos = [];
let currentPage = 1;
let pageCount = 1;
let selectedVideoId = null;

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function removePreloader(container) {
  container.querySelector('.preloader')?.remove();
}

function showPreloader(container) {
  removePreloader(container);
  container.append(preloaderTemplate.content.cloneNode(true));
}

function clearList() {
  cardsList.replaceChildren();
  cardsContainer.querySelector('.more-button')?.remove();
}

function showError(message) {
  const fragment = errorTemplate.content.cloneNode(true);
  fragment.querySelector('.error__title').textContent = message;
  videoContainer.append(fragment);
}

function getCardLinks() {
  return [...cardsList.querySelectorAll('.content__card-link')];
}

function selectVideo(video, link) {
  selectedVideoId = String(video.id);
  setCurrentCard(getCardLinks(), link);
  showPreloader(videoContainer);
  setMainVideo(videoElement, video, API_BASE_URL);
  videoElement.load();
  window.setTimeout(() => removePreloader(videoContainer), MIN_PRELOADER_TIME);
}

function renderMoreButton() {
  cardsContainer.querySelector('.more-button')?.remove();
  if (currentPage >= pageCount) return;

  const button = moreButtonTemplate.content.cloneNode(true);
  cardsContainer.append(button);
}

async function loadVideos({ append = false } = {}) {
  const requestId = requestGate.next();
  const startedAt = Date.now();
  videoContainer.querySelector('.error')?.remove();
  showPreloader(videoContainer);
  cardsList.setAttribute('aria-busy', 'true');
  if (!append) {
    clearList();
    showPreloader(cardsContainer);
  }

  try {
    const url = buildVideosUrl({ ...activeFilters, page: append ? currentPage + 1 : 1 });
    const result = await fetchVideos(url);
    if (!requestGate.isCurrent(requestId)) return;

    if (!append) {
      activeVideos = [];
      selectedVideoId = null;
    }
    activeVideos = activeVideos.concat(result.videos);
    currentPage = result.page;
    pageCount = result.pageCount;
    removePreloader(cardsContainer);

    if (activeVideos.length === 0) {
      clearList();
      showError('Нет подходящих видео =(');
      return;
    }

    renderVideoCards(result.videos, cardTemplate, cardsList, API_BASE_URL);
    renderMoreButton();

    const firstVideo = activeVideos.find((video) => String(video.id) === selectedVideoId) ?? activeVideos[0];
    if (selectedVideoId === null || !activeVideos.some((video) => String(video.id) === selectedVideoId)) {
      selectedVideoId = String(firstVideo.id);
      const firstLink = getCardLinks().find((link) => link.dataset.videoId === selectedVideoId);
      selectVideo(firstVideo, firstLink);
    }
  } catch (error) {
    if (!requestGate.isCurrent(requestId)) return;
    clearList();
    showError('Ошибка получения данных :(');
    console.error(error);
  } finally {
    if (requestGate.isCurrent(requestId)) {
      const remaining = MIN_PRELOADER_TIME - (Date.now() - startedAt);
      if (remaining > 0) await delay(remaining);
      removePreloader(cardsContainer);
      removePreloader(videoContainer);
      cardsList.setAttribute('aria-busy', 'false');
    }
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  activeFilters = readSearchFilters(new FormData(form));
  currentPage = 1;
  loadVideos();
});

cardsList.addEventListener('click', (event) => {
  const link = event.target.closest('.content__card-link');
  if (!link || !cardsList.contains(link)) return;
  event.preventDefault();
  const video = activeVideos.find((item) => String(item.id) === link.dataset.videoId);
  if (video) selectVideo(video, link);
});

cardsContainer.addEventListener('click', (event) => {
  if (event.target.closest('.more-button')) loadVideos({ append: true });
});

loadVideos();
