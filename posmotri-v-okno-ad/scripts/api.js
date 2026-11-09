export const API_BASE_URL = 'https://v-content.practicum-team.ru';
export const DEFAULT_PAGE_SIZE = 5;

export function normalizeVideosResponse(payload) {
  if (!payload || !Array.isArray(payload.results) || !payload.pagination) {
    throw new Error('Video API returned an invalid response');
  }

  const videos = payload.results.filter(
    (video) => video && video.id != null && video.city && video.video?.url && video.poster?.url
  );

  return {
    videos,
    page: Number(payload.pagination.page) || 1,
    pageCount: Number(payload.pagination.pageCount) || 1,
  };
}

export async function fetchVideos(url, fetchImpl = fetch) {
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`Video request failed with status ${response.status}`);
  }
  return normalizeVideosResponse(await response.json());
}

export function buildVideosUrl({
  baseUrl = API_BASE_URL,
  city = '',
  timeSlots = [],
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
} = {}) {
  const url = new URL('/api/videos', baseUrl);
  url.searchParams.set('pagination[pageSize]', String(pageSize));
  url.searchParams.set('pagination[page]', String(page));

  const normalizedCity = city.trim();
  if (normalizedCity) {
    url.searchParams.set('filters[city][$containsi]', normalizedCity);
  }

  for (const timeSlot of timeSlots) {
    url.searchParams.append('filters[time_of_day][$eqi]', timeSlot);
  }

  return url;
}
