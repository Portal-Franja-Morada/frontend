import type { PublicEvent } from "../types/content";
import type { AgendaEvent, EventListItem } from "../types/view";
import {
  formatEventDay,
  formatEventMonth,
  formatEventMonthYear,
  formatEventTime,
  formatEventTimeRange,
} from "./dates";

export function mapPublicEventToListItem(event: PublicEvent): EventListItem {
  return {
    slug: event.slug,
    day: formatEventDay(event.inicio),
    monthYear: formatEventMonthYear(event.inicio),
    title: event.titulo,
    time: formatEventTimeRange(event.inicio, event.fin),
    location: event.lugar,
    href: `/eventos/${event.slug}`,
    inicio: event.inicio,
  };
}

export function mapPublicEventToAgendaEvent(event: PublicEvent): AgendaEvent {
  return {
    slug: event.slug,
    day: formatEventDay(event.inicio),
    month: formatEventMonth(event.inicio),
    title: event.titulo,
    time: formatEventTime(event.inicio),
    location: event.lugar,
    href: `/eventos/${event.slug}`,
  };
}
