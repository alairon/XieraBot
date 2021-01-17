import { readFileSync } from 'fs';
import { CraftingData, CraftingRewardsIndex, CraftingScheduleIndex } from './@types/DailyCrafting';
const DateTime = require('luxon').DateTime;
const TimeStrings = require('../Core/Date/TimeStrings').TimeStrings;
const Messages = require('../Core/Messages/Messages').Messages;
const path = require('path');

export class DailyCrafting {
  private resetHour: number;
  private schedule: CraftingScheduleIndex;
  private rewards: CraftingRewardsIndex;
  private filepath: string;

  constructor(filepath?: string){
    if (filepath){
      this.filepath = path;
    }
    else {
      this.filepath = path.join(__dirname + '../../../DailyCrafting.json');
    }
    this.initData();
  }

  // Reads from the data file and sets the data accordingly
  private initData(): void{
    let contents: string;
    try {
      contents = readFileSync(this.filepath, {encoding: 'utf8', flag: 'r'});
    }
    catch (err){
      console.error(`The file specified couldn't be read:\n${err}`);
      return;
    }

    const data = <CraftingData>JSON.parse(contents);
    this.resetHour = data.DailyResetUTC;
    this.schedule = <CraftingScheduleIndex>(data.Schedule);
    this.rewards = <CraftingRewardsIndex>(data.Rewards);
  }

  // Returns a 0-based index based on the date and hour.
  private getDayIndex(): number{
    const now = DateTime.utc();
    if (now.c.hour < this.resetHour){
      // Return yesterday's date
      return ((now.minus({days: 1}).c.day)-1);
    }
    // Return today's date
    return ((now.c.day)-1);
  }

  private dailyCraftResetDate(now: Date): number{
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const date = now.getUTCDate();
    const hour = now.getUTCHours();
    
    if (hour >= 4){
      return (Date.UTC(year, month, date+1, 4));
    }
    return (Date.UTC(year, month, date, 4));
  }

  public getDailyName(): string{
    const dayIndex = this.getDayIndex();
    return (this.schedule[dayIndex].name);
  }

  public getDailyCrafting(): string{
    const Message = new Messages();
    const now: Date = new Date();
    const dayIndex = this.getDayIndex();

    const dailyReward = this.rewards[this.schedule[dayIndex].schedule];
    const duration: string = TimeStrings.totalTimeString(this.dailyCraftResetDate(now) - now.getTime());

    Message.addHeaderMessage("Here's what you might be able to get out of today's daily crafting!");
    Message.addMessageln(`Time left to complete today's orders: **${duration}**`);
    Message.addMessage('```');

    for (const idx in dailyReward){
      Message.addMessageln(`${dailyReward[idx].index}: ${dailyReward[idx].item} (x${dailyReward[idx].quantity})`);
    }
    Message.addMessageln('```');
    Message.addMessage(`Disclaimer: The data I got from Kifas seems to be kinda off... There may be more rewards shown here than what's actually possible, although looks to be mostly extra XS Lillipariums, so it should be okay.`);

    return(Message.getMessage());
  }
}
