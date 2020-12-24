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
  weeklyMissions: {
    hour: 8,
    weekday: 3 //Wednesday
  }
}

export class Reset {
  private static DailyMissionResetHour: number = resetTable.dailyMissions.hour;
  private static FreshFindsResetHour: number = resetTable.freshFinds.hour;
  private static DailyCraftingResetHour: number = resetTable.dailyCrafting.hour;
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
    const hour = LocalDate.getUTCHours();
    let date = LocalDate.getUTCDate();
    const weekday = LocalDate.getUTCDay();
    
    // Days until the desired weekday
    const adjustedDate = date + 7 - ((weekday + ((7 - resetWeekday) % 7)) %7);
    return (Date.UTC(year, month, adjustedDate, resetHour));
  }
  
  public static getResetTable(){
    const Message = new Messages();
    const now = new Date();

    // Header
    Message.addHeaderMessageln(`As of ${UTCStrings.getTimestamp(now)} UTC, here's when things will reset:`);

    // Daily Mission
    const DailyMission = this.buildDailyResetDate(now, this.DailyMissionResetHour);
    Message.addMessageln(`**Daily Missions**\`\`\`ldif\nAlso includes: Arkuma Slots\nResets: Daily at 08:00 UTC\nNext reset: ${TimeStrings.totalTimeString(DailyMission - now.getTime())}\`\`\``);

    // Fresh Finds
    const FreshFinds = this.buildDailyResetDate(now, this.FreshFindsResetHour);
    Message.addMessageln(`**Fresh Finds**\`\`\`ldif\nRefreshes: Daily at 06:00 UTC\nNext refresh: ${TimeStrings.totalTimeString(FreshFinds - now.getTime())}\`\`\``);

    // Daily Crafting
    const DailyCrafting = this.buildDailyResetDate(now, this.DailyCraftingResetHour);
    Message.addMessageln(`**Daily Crafting**\`\`\`ldif\nResets: Daily at 04:00 UTC\nNext reset: ${TimeStrings.totalTimeString(DailyCrafting - now.getTime())}\`\`\``);

    // Weekly Mission
    const WeeklyMission = this.buildWeeklyResetDate(now, this.WeeklyMissionResetHour, this.WeeklyMissionResetWeekday);
    Message.addMessageln(`**Weekly Missions**\`\`\`ldif\nAlso includes: Tier Missions, Alliance Orders, Limited Buster Medals, Prize Medals, Battle Coin, Casino Coin Exchanges, and certain Extreme Quests\nResets: Wednesdays at 08:00 UTC\nNext reset: ${TimeStrings.totalTimeString(WeeklyMission - now.getTime())}\`\`\``);

    return (Message.getMessage());
  }
}
