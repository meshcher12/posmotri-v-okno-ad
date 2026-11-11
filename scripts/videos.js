const video = './media/video1.mp4';
const sample = './media/sample.mp4';

export const VIDEOS = [
  {
    id: 'saint-petersburg',
    city: 'Санкт-Петербург',
    description: 'Утренний вид на Неву и Дворцовую площадь.',
    time: 'morning',
    video: { url: video },
    poster: { url: './media/poster1.jpg' },
  },
  {
    id: 'moscow',
    city: 'Москва',
    description: 'Дневной вид на Красную площадь.',
    time: 'afternoon',
    video: { url: video },
    poster: { url: './media/poster2.jpg' },
  },
  {
    id: 'kazan',
    city: 'Казань',
    description: 'Ночной вид на Казанский кремль.',
    time: 'night',
    video: { url: video },
    poster: { url: './media/poster3.jpg' },
  },
  {
    id: 'sochi',
    city: 'Сочи',
    description: 'Утренний вид на Чёрное море.',
    time: 'morning',
    video: { url: sample },
    poster: { url: './media/poster1.jpg' },
  },
  {
    id: 'yekaterinburg',
    city: 'Екатеринбург',
    description: 'Дневной вид на городской пруд.',
    time: 'afternoon',
    video: { url: sample },
    poster: { url: './media/poster2.jpg' },
  },
  {
    id: 'novosibirsk',
    city: 'Новосибирск',
    description: 'Ночной вид на Обь.',
    time: 'night',
    video: { url: sample },
    poster: { url: './media/poster3.jpg' },
  },
  {
    id: 'vladivostok',
    city: 'Владивосток',
    description: 'Утренний вид на Золотой мост.',
    time: 'morning',
    video: { url: video },
    poster: { url: './media/poster1.jpg' },
  },
  {
    id: 'kaliningrad',
    city: 'Калининград',
    description: 'Дневной вид на Рыбную деревню.',
    time: 'afternoon',
    video: { url: sample },
    poster: { url: './media/poster2.jpg' },
  },
];
