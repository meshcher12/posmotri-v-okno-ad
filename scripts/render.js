export function renderVideoCard(video, template, baseUrl) {
  const fragment = template.content.cloneNode(true);
  const link = fragment.querySelector('.content__card-link');
  const title = fragment.querySelector('.content__video-card-title');
  const description = fragment.querySelector('.content__video-card-description');
  const thumbnail = fragment.querySelector('.content__video-card-thumbnail');
  const thumbnailUrl = video.thumbnail?.url ?? video.poster.url;

  link.dataset.videoId = String(video.id);
  title.textContent = video.city;
  description.textContent = video.description;
  thumbnail.src = new URL(thumbnailUrl, baseUrl).href;
  thumbnail.alt = `Вид на город ${video.city}`;
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

export function setCurrentCard(cards, currentCard) {
  for (const card of cards) {
    const isCurrent = card === currentCard;
    card.classList.toggle('content__card-link_current', isCurrent);
    if (isCurrent) {
      card.setAttribute('aria-current', 'true');
    } else {
      card.removeAttribute('aria-current');
    }
  }
}

export function setMainVideo(videoElement, video, baseUrl) {
  videoElement.src = new URL(video.video.url, baseUrl).href;
  videoElement.poster = new URL(video.poster.url, baseUrl).href;
  videoElement.load();
}
