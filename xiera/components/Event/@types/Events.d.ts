import { Quests } from "../Quests";

export interface EventScheduleObject {
  title: string,
  events: [
    startDate: string,
    endDate: string
  ],
  categoryId: number,
  schedule: {
    timeZone: string
  }
}

export interface EventTime {
  [index: number]: {
    startDate: string,
    endDate: string
  }
}

export interface EventObject {
  title: string,
  tags?: string,
  alt?: string,
  categoryId: number,
  startTime: string,
  endTime: string
}

export interface IndexedEventObject {
  [index: number]: {
    title: string,
    events: EventTime,
    categoryId: number,
    schedule: {
      timeZone: string
    }
  }
}

export interface SearchEntity {
  item: {
    title: string,
    tags: string,
    alt: string
  }
}

export interface SearchIndexEntity {
  [index: number]: {
    item: {
      title: string,
      startTime: string,
      endTime: string
    }
  }
}

export interface IndexedQueryEventObject{
  [index: number]: {
    title: string,
    categoryId: number,
    startTime: string,
    endTime: string
  }
}
