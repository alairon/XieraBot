interface RequestItem {
  requester: string,
  item: string
}

interface RewardItem {
  index: number,
  item: string,
  quantity: number
}

export interface CraftingScheduleIndex {
  [index: number]: {
    day: number,
    name: string,
    schedule: string,
    request1?: RequestItem,
    request2?: RequestItem,
    request3?: RequestItem,
    request4?: RequestItem,
    request5?: RequestItem,
    request6?: RequestItem,
    request7?: RequestItem,
    request8?: RequestItem,
    request9?: RequestItem
  }
}

export interface CraftingRewardsIndex {
  [identifier: string]: {
    [index: number]: RewardItem
  }
}

export interface CraftingData {
  DailyResetUTC: number,
  Schedule: CraftingScheduleIndex,
  Rewards: CraftingRewardsIndex
}