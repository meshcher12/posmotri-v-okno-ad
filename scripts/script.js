import { renderVideoCards, setCurrentCard, setMainVideo } from './render.js';
import { VIDEOS } from './videos.js';

const CARDS_PER_PAGE = 5;
const cardsList = document.querySelector('.content__list');
const cardsContainer = document.querySelector('.content__list-container');
const videoContainer = document.querySelector('.result__video-container');
const videoElement = document.querySelector('.result__video');
const form = document.querySelector('.search-form');
const cardTemplate = document.querySelector('.cards-list-item-template');
const preloaderTemplate = document.querySelector('.preloader-template');
const errorTemplate = document.querySelector('.error-template');
const moreButtonTemplate = document.querySelector('.more-button-template');

let filteredVideos = [...VIDEOS];
let visibleCount = CARDS_PER_PAGE;
let selectedVideoId = null;
let renderVersion = 0;

function showPreloader(container) {
  if (!container.querySelector('.preloader')) {
    container.append(preloaderTemplate.content.cloneNode(true));
  }
}

function removePreloader(container) {
  container.querySelector('.preloader')?.remove();
}

function removeError() {
  videoContainer.querySelector('.error')?.remove();
}

function showError(message) {
  const fragment = errorTemplate.content.cloneNode(true);
  fragment.querySelector('.error__title').textContent = message;
  videoContainer.append(fragment);
}

function getCardLinks() {
  return [...cardsList.querySelectorAll('.content__card-link')];
}

function renderMoreButton() {
  cardsContainer.querySelector('.more-button')?.remove();
  if (visibleCount >= filteredVideos.length) return;
  cardsContainer.append(moreButtonTemplate.content.cloneNode(true));
}

function renderResults() {
  cardsList.replaceChildren();
  cardsContainer.querySelector('.more-button')?.remove();

  const visibleVideos = filteredVideos.slice(0, visibleCount);
  if (visibleVideos.length === 0) {
    showError('Нет подходящих видео =(');
    return;
  }

  renderVideoCards(visibleVideos, cardTemplate, cardsList, document.baseURI);
  renderMoreButton();
  cardsContainer.classList.add('custom-scrollbar');

  const selectedVideo = visibleVideos.find(
    (video) => String(video.id) === selectedVideoId
  ) ?? visibleVideos[0];
  const selectedLink = getCardLinks().find(
    (link) => link.dataset.videoId === String(selectedVideo.id)
  );
  setCurrentCard(getCardLinks(), selectedLink);

  if (selectedVideoId !== String(selectedVideo.id)) {
    selectedVideoId = String(selectedVideo.id);
    setMainVideo(videoElement, selectedVideo, document.baseURI);
  }
}

function scheduleRender() {
  const currentRender = ++renderVersion;
  removeError();
  showPreloader(videoContainer);
  showPreloader(cardsContainer);
  window.setTimeout(() => {
    if (currentRender !== renderVersion) return;
    renderResults();
    removePreloader(videoContainer);
    removePreloader(cardsContainer);
  }, 300);
}

function selectVideo(video, link) {
  selectedVideoId = String(video.id);
  setCurrentCard(getCardLinks(), link);
  showPreloader(videoContainer);
  setMainVideo(videoElement, video, document.baseURI);
  window.setTimeout(() => removePreloader(videoContainer), 300);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const city = String(formData.get('city') ?? '').trim().toLocaleLowerCase('ru');
  const selectedTimes = new Set(formData.getAll('time').map(String));

  filteredVideos = VIDEOS.filter((video) => {
    const matchesCity = !city || video.city.toLocaleLowerCase('ru').includes(city);
    const matchesTime = selectedTimes.size === 0 || selectedTimes.has(video.time);
    return matchesCity && matchesTime;
  });

  visibleCount = CARDS_PER_PAGE;
  selectedVideoId = null;
  scheduleRender();
});

cardsList.addEventListener('click', (event) => {
  const link = event.target.closest('.content__card-link');
  if (!link || !cardsList.contains(link)) return;
  event.preventDefault();
  const video = filteredVideos.find(
    (item) => String(item.id) === link.dataset.videoId
  );
  if (video) selectVideo(video, link);
});

cardsContainer.addEventListener('click', (event) => {
  if (!event.target.closest('.more-button')) return;
  visibleCount += CARDS_PER_PAGE;
  scheduleRender();
});

showPreloader(videoContainer);
showPreloader(cardsContainer);
scheduleRender();
