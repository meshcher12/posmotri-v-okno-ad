export const API_BASE_URL = 'https://v-content.practicum-team.ru';
export const DEFAULT_PAGE_SIZE = 5;

export async function fetchVideos(url, fetchImpl = fetch) {
  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`Video request failed with status ${response.status}`);
  }
  return response.json();
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
