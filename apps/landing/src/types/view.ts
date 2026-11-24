export type AgendaEvent = {
  slug: string;
  day: string;
  month: string;
  title: string;
  time: string;
  location: string;
  href: string;
};

export type NewsItem = {
  slug: string;
  category: string;
  title: string;
  image: string;
  imageAlt: string;
  href: string;
};

export type HomeViewModel = {
  events: AgendaEvent[];
  news: NewsItem[];
};
