const TimeStrings = require('../Core/Date/TimeStrings').TimeStrings;
const UTCStrings = require('../Core/Date/UTCStrings').UTCStrings;
const Messages = require('../Core/Messages/Messages').Messages;
import { ResetTable } from './@types/Reset';

const resetTable: ResetTable = {
  dailyMissions: {
    hour: 8
  },
  freshFinds: {
    hour: 6
  },
  dailyCrafting: {
    hour: 4
  },
  dailyLogin: {
    hour: 15
  },
  weeklyRankings: {
    hour: 15,
    weekday: 1 //Monday
  },
  weeklyMissions: {
    hour: 8,
    weekday: 3 //Wednesday
  }
}

export class Reset {
  private static DailyMissionResetHour: number = resetTable.dailyMissions.hour;
  private static FreshFindsResetHour: number = resetTable.freshFinds.hour;
  private static DailyCraftingResetHour: number = resetTable.dailyCrafting.hour;
  private static DailyLoginResetHour: number = resetTable.dailyLogin.hour;
  private static WeeklyRankingResetHour: number = resetTable.weeklyRankings.hour;
  private static WeeklyRankingResetWeekday: number = resetTable.weeklyRankings.weekday;
  private static WeeklyMissionResetHour: number = resetTable.weeklyMissions.hour;
  private static WeeklyMissionResetWeekday: number = resetTable.weeklyMissions.weekday;
  
  private static buildDailyResetDate(LocalDate: Date, resetHour: number): number{
    const year = LocalDate.getUTCFullYear();
    const month = LocalDate.getUTCMonth();
    const date = LocalDate.getUTCDate();
    const hour = LocalDate.getUTCHours();
    
    if (hour >= resetHour){
      return (Date.UTC(year, month, date+1, resetHour));
    }
    return (Date.UTC(year, month, date, resetHour));
  }

  private static buildWeeklyResetDate(LocalDate: Date, resetHour: number, resetWeekday: number): number{
    const year = LocalDate.getUTCFullYear();
    const month = LocalDate.getUTCMonth();
    let date = LocalDate.getUTCDate();
    const weekday = LocalDate.getUTCDay();
    
    // Days until the desired weekday
    let adjustedDate = date + 7 - ((weekday + ((7 - resetWeekday) % 7)) %7);
    if ((weekday == resetWeekday) && LocalDate.getUTCHours() < resetHour) adjustedDate -= 7;
    return (Date.UTC(year, month, adjustedDate, resetHour));
  }

  private static buildMonthlyResetDate(LocalDate: Date, resetHour: number, resetDay: number): number{
    const year = LocalDate.getUTCFullYear();
    let month = LocalDate.getUTCMonth();
    const date = LocalDate.getUTCDate();

    if (date > resetDay){
      month++;
    }

    return (0);
  }
  
  public static getResetTable(){
    const Message = new Messages();
    const now = new Date();

    // Header
    Message.addHeaderMessageln(`As of ${UTCStrings.getShortTimestamp(now)} UTC, here's when things will reset:`);

    // Daily Mission
    const DailyMission = this.buildDailyResetDate(now, this.DailyMissionResetHour);
    Message.addMessageln(`**Daily Missions**\nIncludes: Arkuma Slots\n\`\`\`ldif\nResets: Daily at 08:00 UTC\nNext reset: ${TimeStrings.totalTimeString(DailyMission - now.getTime())}\`\`\``);

    // Daily Login
    const DailyLogin = this.buildDailyResetDate(now, this.DailyLoginResetHour);
    Message.addMessageln(`**Daily Login**\nIncludes: FUN points\n\`\`\`ldif\nResets: Daily at 15:00 UTC\nNext reset: ${TimeStrings.totalTimeString(DailyLogin - now.getTime())}\`\`\``);

    // Fresh Finds
    const FreshFinds = this.buildDailyResetDate(now, this.FreshFindsResetHour);
    Message.addMessageln(`**Fresh Finds**\`\`\`ldif\nRefreshes: Daily at 06:00 UTC\nNext refresh: ${TimeStrings.totalTimeString(FreshFinds - now.getTime())}\`\`\``);

    // Daily Crafting
    const DailyCrafting = this.buildDailyResetDate(now, this.DailyCraftingResetHour);
    Message.addMessageln(`**Daily Crafting**\`\`\`ldif\nResets: Daily at 04:00 UTC\nNext reset: ${TimeStrings.totalTimeString(DailyCrafting - now.getTime())}\`\`\``);

    // Weekly Rankings
    const WeeklyRanking = this.buildWeeklyResetDate(now, this.WeeklyRankingResetHour, this.WeeklyRankingResetWeekday);
    Message.addMessageln(`**Weekly Rankings**\nIncludes: Rare Containers Opened, Personal Quarters Visits, and Time Attack Map & Times\`\`\`ldif\nResets: Mondays at 15:00 UTC\nNext Reset: ${TimeStrings.totalTimeString(WeeklyRanking - now.getTime())}\`\`\``);

    // Weekly Mission
    const WeeklyMission = this.buildWeeklyResetDate(now, this.WeeklyMissionResetHour, this.WeeklyMissionResetWeekday);
    Message.addMessageln(`**Weekly Missions**\nIncludes: Tier Missions, Alliance Orders, certain Extreme Quests, and all Limited Buster Medals, Prize Medals, Battle Coin, and Casino Coin Exchanges\n\`\`\`ldif\nResets: Wednesdays at 08:00 UTC\nNext reset: ${TimeStrings.totalTimeString(WeeklyMission - now.getTime())}\`\`\``);

    return (Message.getMessage());
  }
}
