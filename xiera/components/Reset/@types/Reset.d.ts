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
  dailyLogin: {
    hour: number
  },
  dailySurpression: {
    hour: number
  },
  weeklyRankings: {
    hour: number,
    weekday: number
  },
  weeklyExtremeQuests: {
    hour: number,
    weekday: number
  },
  weeklyMissions: {
    hour: number,
    weekday: number
  }
}
