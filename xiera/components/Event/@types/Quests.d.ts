export interface EventObject {
  title: string,
  tags?: string,
  alt?: string,
  categoryId: number,
  startTime: string,
  endTime: string
}

export interface QueryObject {
  Quests: {
    title: string,
    categoryId: number,
    startTime: string,
    endTime: string
  }
}
