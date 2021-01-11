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
  weeklyRankings: {
    hour: number,
    weekday: number
  },
  weeklyMissions: {
    hour: number,
    weekday: number
  }
}
