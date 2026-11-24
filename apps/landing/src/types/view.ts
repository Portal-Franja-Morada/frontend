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

export type EventListItem = {
  slug: string;
  day: string;
  monthYear: string;
  title: string;
  time: string;
  location: string;
  href: string;
  inicio: string;
};

export type HomeViewModel = {
  events: AgendaEvent[];
  news: NewsItem[];
};
