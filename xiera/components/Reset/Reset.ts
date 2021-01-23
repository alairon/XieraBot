const TimeStrings = require('../Core/Date/TimeStrings').TimeStrings;
const UTCStrings = require('../Core/Date/UTCStrings').UTCStrings;
const Messages = require('../Core/Messages/Messages').Messages;
const DailyCrafting = require('../DailyCrafting/DailyCrafting').DailyCrafting;
import { MessageEmbed } from 'discord.js';
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
  
  // Returns the current date or a future UTC date depending if the current hour has passed the set hour
  private static buildDailyResetDate(LocalDate: Date, resetHour: number): number{
    const year = LocalDate.getUTCFullYear();
    const month = LocalDate.getUTCMonth();
    const date = LocalDate.getUTCDate();
    const hour = LocalDate.getUTCHours();
    
    // Return the next day if the current hour has passed the set hour
    if (hour >= resetHour){
      return (Date.UTC(year, month, date+1, resetHour));
    }
    // Keep the current day if the current hour hasn't passed the set hour
    return (Date.UTC(year, month, date, resetHour));
  }

  // Returns an upcoming date depending on the set weekday and hour
  private static buildWeeklyResetDate(LocalDate: Date, resetHour: number, resetWeekday: number): number{
    const year = LocalDate.getUTCFullYear();
    const month = LocalDate.getUTCMonth();
    let date = LocalDate.getUTCDate();
    const weekday = LocalDate.getUTCDay();
    
    // Days until the desired weekday
    let adjustedDate = date + 7 - (weekday + (7 - resetWeekday)) %7;

    // Keep the current day if the current hour isn't past the reset hour
    if ((weekday == resetWeekday) && LocalDate.getUTCHours() < resetHour) adjustedDate -= 7;
    return (Date.UTC(year, month, adjustedDate, resetHour));
  }

  // Returns a number representing the time left until the 28 day reset period
  private static buildClassEXResetDate(LocalDate: Date): number{
    // A date of reference (December 23, 2020 at 8AM UTC)
    const baseDate = new Date('2020-12-23T08:00:00Z').getTime();
    // 2419200000 = 28 days in ms
    const time = (LocalDate.getTime()- baseDate) % 2419200000;

    return (2419200000 - time);
  }

  private static getDCScheduleType(): string{
    const dc = new DailyCrafting();
    return (dc.getDailyName());
  }
  
  public static getResetTable(){
    const Message = new Messages();
    const now = new Date();

    // Header
    Message.addHeaderMessageln(`As of ${UTCStrings.getShortTimestamp(now)} UTC, here's when things will reset:`);

    // Daily Crafting
    const DailyCrafting: number = this.buildDailyResetDate(now, this.DailyCraftingResetHour);
    Message.addMessageln(`**Daily Crafting**\`\`\`ldif\nResets: Daily at 04:00 UTC\nNext reset: ${TimeStrings.totalTimeString(DailyCrafting - now.getTime())}\`\`\``);

    // Fresh Finds
    const FreshFinds: number = this.buildDailyResetDate(now, this.FreshFindsResetHour);
    Message.addMessageln(`**Fresh Finds**\`\`\`ldif\nRefreshes: Daily at 06:00 UTC\nNext refresh: ${TimeStrings.totalTimeString(FreshFinds - now.getTime())}\`\`\``);

    // Daily Mission
    const DailyMission: number = this.buildDailyResetDate(now, this.DailyMissionResetHour);
    Message.addMessageln(`**Daily Missions**\nIncludes: Arkuma Slots\n\`\`\`ldif\nResets: Daily at 08:00 UTC\nNext reset: ${TimeStrings.totalTimeString(DailyMission - now.getTime())}\`\`\``);

    // Daily Login
    const DailyLogin: number = this.buildDailyResetDate(now, this.DailyLoginResetHour);
    Message.addMessageln(`**Daily Login**\nIncludes: FUN points, Omega Masquerader Surpressions\n\`\`\`ldif\nResets: Daily at 15:00 UTC\nNext reset: ${TimeStrings.totalTimeString(DailyLogin - now.getTime())}\`\`\``);

    // Weekly Rankings
    const WeeklyRanking: number = this.buildWeeklyResetDate(now, this.WeeklyRankingResetHour, this.WeeklyRankingResetWeekday);
    Message.addMessageln(`**Weekly Rankings**\nIncludes: Rare Containers Opened, Personal Quarters Visits, and Time Attack Map & Times\`\`\`ldif\nResets: Mondays at 15:00 UTC\nNext Reset: ${TimeStrings.totalTimeString(WeeklyRanking - now.getTime())}\`\`\``);

    // Weekly Mission
    const WeeklyMission: number = this.buildWeeklyResetDate(now, this.WeeklyMissionResetHour, this.WeeklyMissionResetWeekday);
    Message.addMessageln(`**Weekly Missions**\nIncludes: Tier Missions, Alliance Orders, certain Extreme Quests, and all Limited Buster Medals, Prize Medals, Battle Coin, and Casino Coin Exchanges\n\`\`\`ldif\nResets: Wednesdays at 08:00 UTC\nNext reset: ${TimeStrings.totalTimeString(WeeklyMission - now.getTime())}\`\`\``);

    // Limited Class EX cube
    const MonthlyClassEXCubes: number = this.buildClassEXResetDate(now);
    Message.addMessageln(`**Limited Class EX Cube Shop**\nIncludes: EXP 500,000 ticket, Augment Transfer Passes\`\`\`ldif\nResets: Every 4 weeks (28 days) at 08:00 UTC\nNext Reset: ${TimeStrings.totalTimeString(MonthlyClassEXCubes)}\`\`\``);

    return (Message.getMessage());
  }

  public static getResetTableEmbed(): MessageEmbed {
    const now = new Date();
    const DailyCrafting: number = this.buildDailyResetDate(now, this.DailyCraftingResetHour);
    const FreshFinds: number = this.buildDailyResetDate(now, this.FreshFindsResetHour);
    const DailyMission: number = this.buildDailyResetDate(now, this.DailyMissionResetHour);
    const DailyLogin: number = this.buildDailyResetDate(now, this.DailyLoginResetHour);
    const WeeklyRanking: number = this.buildWeeklyResetDate(now, this.WeeklyRankingResetHour, this.WeeklyRankingResetWeekday);
    const WeeklyMission: number = this.buildWeeklyResetDate(now, this.WeeklyMissionResetHour, this.WeeklyMissionResetWeekday);
    const MonthlyClassEXCubes: number = this.buildClassEXResetDate(now);
    const dcScheduleType: string = this.getDCScheduleType();

    const embed = new MessageEmbed();
    embed.setColor('#da79b1');
    embed.setTitle('PSO2 Reset Schedule');
    embed.setDescription('There\'s a lot of different times when things reset around here, so here\'s a handy list showing when they\'ll happen.');
    embed.addFields(
      {name: '__Daily Crafting__', value: `Today's Rewards: ${dcScheduleType}\nResets: \`Daily at 04:00 UTC\`\nNext Reset: \`${TimeStrings.totalTimeString(DailyCrafting - now.getTime())}\`\n\u200B`},

      {name: '__Fresh Finds__', value: `Does not include featured items\nRefreshes: \`Daily at 06:00 UTC\`\nRefreshes in \`${TimeStrings.totalTimeString(FreshFinds - now.getTime())}\`\n\u200B`},

      {name: '__Daily Missions__', value: `Includes: Arkuma Slots\nResets: \`Daily at 08:00 UTC\`\nNext Reset: \`${TimeStrings.totalTimeString(DailyMission - now.getTime())}\`\n\u200B`},
      
      {name: '__Daily Login__', value: `Includes: FUN Points, Omega Masquerader Surpressions\nResets: \`Daily at 15:00 UTC\`\nNext Reset: \`${TimeStrings.totalTimeString(DailyLogin - now.getTime())}\`\n\u200B`},

      {name: '__Weekly Rankings__', value: `Includes: Rare Containers Opened, Personal Quarters Visits, and Time Attack (Map Selection & Times)\nResets: \`Mondays at 15:00 UTC\`\nNext Reset: \`${TimeStrings.totalTimeString(WeeklyRanking - now.getTime())}\`\n\u200B`},

      {name: '__Weekly Missions__', value: `Includes: Tier Missions, Alliance Orders, certain Extreme Quests, and Divide Quests (Rewards & Rankings)\nResets: \`Wednesdays at 08:00 UTC\`\nNext Reset: \`${TimeStrings.totalTimeString(WeeklyMission - now.getTime())}\`\n\u200B`},
      
      {name: '__Limited Shops (Weekly)__', value: `Includes: Buster Medals, Prize Medals, Battle Coins, and Casino Coins\nResets: \`Wednesdays at 08:00 UTC\`\nNext Reset: \`${TimeStrings.totalTimeString(WeeklyMission - now.getTime())}\`\n\u200B`},

      {name: '__Limited Shops (Monthly)__', value: `Includes: Limited Class EX Cube Shop, and Divide Medals Shop\nResets: \`Every 28 days at 08:00 UTC\`\nNext Reset: \`${TimeStrings.totalTimeString(MonthlyClassEXCubes)}\`\n\u200B`}
    );
    embed.setTimestamp();
    embed.setFooter('Hopefully things will be more consistent');

    return (embed);
  }
}
