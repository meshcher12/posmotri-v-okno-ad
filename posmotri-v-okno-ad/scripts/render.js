export function renderVideoCard(video, template, baseUrl) {
  const fragment = template.content.cloneNode(true);
  const link = fragment.querySelector('.content__card-link');
  const title = fragment.querySelector('.content__video-card-title');
  const description = fragment.querySelector('.content__video-card-description');
  const thumbnail = fragment.querySelector('.content__video-card-thumbnail');

  link.dataset.videoId = String(video.id);
  title.textContent = video.city;
  description.textContent = video.description ?? '';
  thumbnail.src = new URL(video.thumbnail.url, baseUrl).href;
  thumbnail.alt = video.description || `Видео из города ${video.city}`;
  thumbnail.loading = 'lazy';

  return fragment;
}

export function renderVideoCards(videos, template, list, baseUrl) {
  const fragment = document.createDocumentFragment();
  for (const video of videos) {
    fragment.append(renderVideoCard(video, template, baseUrl));
  }
  list.append(fragment);
}

export function setMainVideo(videoElement, video, baseUrl) {
  videoElement.src = new URL(video.video.url, baseUrl).href;
  videoElement.poster = new URL(video.poster.url, baseUrl).href;
}
