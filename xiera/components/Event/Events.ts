import Fuse = require('fuse.js');
import quests = require('./Quests');
import casino = require('./Casino');
import WebJSON = require('../Network/WebJSON');
import UTCStrings = require('../Core/Date/UTCStrings');

// Regular expression for URLs
// Format: http(s):// ...
const urlRegExp = /https?:\/\/.*/mi;

interface EventScheduleObject {
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

interface EventTime {
  [index: number]: {
    startDate: string,
    endDate: string
  }
}

interface EventObject {
  title: string,
  categoryId: number,
  startTime: string,
  endTime: string
}

interface IndexedEventObject {
  [index: number]: {
    title: string,
    events: EventTime,
    categoryId: number,
    schedule: {
      timeZone: string
    }
  }
}

interface IndexedQueryEventObject {
  Quests: {
    title: string,
    categoryId: string,
    startTime: string,
    endTime: string
  }
}

export class Events{
  private quests: Array<object>;
  private casino: Array<object>;
  private eventURL: string;
  private refreshInterval: number;
  private eventRefreshTimeout: NodeJS.Timeout;

  // Constructor
  constructor(){
    this.quests = [];
    this.casino = [];
    this.eventURL = '';
    this.refreshInterval = 21600000; // Default: 6 hours
  }

  // Returns the URL to where the JSON is located
  public getEventURL(): string{
    return (this.eventURL);
  }

  // Provides the contents in the Quests array
  public getEvents(): object{
    // Debug text
    for (const idx in this.quests){
      const mainEvent: EventObject = <EventObject>this.quests[idx];
      const outputEvent: EventObject = {
        title: mainEvent.title,
        categoryId: mainEvent.categoryId,
        startTime: mainEvent.startTime,
        endTime: mainEvent.endTime
      }
      console.log(outputEvent);
    }
    console.log('===========');
    /* 888888 */
    return (this.quests);
  }
  

  public getCasinoEvents(): object{
    return (this.casino);
  }

  // Sets the URL
  private setURL(url: string): boolean{
    if (this.validURL(url)){
      this.eventURL = url;
      return (true);
    }
    return (false);
  }

  // Adds an individual urgent quest or concert
  private addEvent(event: EventObject): boolean{
    if (event){
      const title: string = event.title;
      const categoryId: number = event.categoryId;
      const startTime: string = event.startTime;
      const endTime: string = event.endTime;
      
      const parsedEvent = new quests.Quests({title, categoryId, startTime, endTime});
      this.quests.push(parsedEvent);
      return (true);
    }
    return (false);
  }

  // Adds an individual casino event
  private addCasinoEvent(event: EventObject): boolean{
    if (event){
      const title: string = event.title;
      const categoryId: number = event.categoryId;
      const startTime: string = event.startTime;
      const endTime: string = event.endTime;
      
      //const parsedEvent = new casino.Casino({title, categoryId, startTime, endTime});
      //this.casino.push(parsedEvent);
      return (true);
    }
    return (false);
  }

  // Searches for a specific event
  public searchQuests(searchTerm: string): Array<object>{
    // LOGIC: Search a separate UQ table BEFORE searching for the event. This table is an alias table.
    // If found, THEN search the event calendar
    return (null);
  }

  public searchCasino(searchTerm: string): Array<object>{
    // LOGIC: Unlike searchQuests, search the event calendar directly as the casino only offers five different activity types
    return (null);
  }

  // Tests if the URL is in the correct format. See the constant urlRegExp above.
  private validURL(url: string): boolean{
    if (urlRegExp.test(url)){
      return (true);
    }
    return (false);
  }

  // Downloads a JSON from a specific URL
  private async downloadEvents(): Promise<object>{
    const events = await WebJSON.WebJSON.getJSON(this.eventURL);
    return (events);
  }

  public async initEvents(url?: string, refreshInterval?: number): Promise<void>{
    if (!this.setURL(url)){
      console.log('The URL isn\'t valid');
      return (null);
    }
    // Load the events
    const ScheduleEvents: IndexedEventObject= <IndexedEventObject>(await this.downloadEvents());
    if (!ScheduleEvents){
      return (null);
    }

    //Insert the events into the appropriate array
    for (const idx in ScheduleEvents){
      for (const idy in ScheduleEvents[idx].events){
        const eventData: EventObject = {
          title: ScheduleEvents[idx].title,
          categoryId: ScheduleEvents[idx].categoryId,
          startTime: UTCStrings.UTCStrings.getISOStringWithLocale(ScheduleEvents[idx].events[idy].startDate, ScheduleEvents[idx].schedule.timeZone),
          endTime: UTCStrings.UTCStrings.getISOStringWithLocale(ScheduleEvents[idx].events[idy].endDate, ScheduleEvents[idx].schedule.timeZone)
        }

        switch(ScheduleEvents[idx].categoryId){
          case 9: // Urgent Quests
          case 10: // Live Concerts
            this.addEvent(eventData);
            break;
          case 11: // Casino Boosts
            this.addCasinoEvent(eventData);
            break;
          default:
            // All other event types
            break;
        }
      }
    }
  }
}
