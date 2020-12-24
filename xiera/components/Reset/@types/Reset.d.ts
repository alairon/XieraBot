export interface ResetTable {
  dailyCrafting: {
    hour: number,
  }
  freshFinds: {
    hour: number
  },
  dailyMissions: {
    hour: number
  },
  weeklyMissions: {
    hour: number,
    weekday: number
  }
}
