import Fuse = require('fuse.js');
import quests = require('./Quests');
import casino = require('./Casino');
import iCal = require('../Core/ICS/iCalendar');

// Regular expression for URLs to an iCalendar file
// Format: http(s):// ... .ics
const urlRegExp = /https?:\/\/.*.ics/mi;

interface EventObject {
  uid: string,
  summary: string,
  start?: string,
  startTime: string,
  end?: string,
  endTime: string
}

interface IndexedEventObject {
  [index: string]: {
    uid: string,
    summary: string,
    start: string,
    end: string
  };
}

export class Events{
  private quests: Array<object>;
  private casino: Array<object>;
  private questURL: string;
  private casinoURL: string;
  private questRefreshInterval: number;
  private casinoRefreshInterval: number;
  private questRefreshTimeout: NodeJS.Timeout;
  private casinoRefreshTimeout: NodeJS.Timeout;

  // Constructor
  constructor(){
    this.quests = [];
    this.casino = [];
    this.questURL = '';
    this.casinoURL = '';
    this.questRefreshInterval = 21600000; // Default: 6 hours
    this.casinoRefreshInterval = 21600000; // Default: 6 hours
  }

  // Gets the URL to the Quests iCalendar
  public getQuestURL(): string{
    return (this.questURL);
  }

  // Gets the URL to the Casino iCalendar
  public getCasinoURL(): string{
    return (this.casinoURL);
  }

  public getQuestEvents(): object{
    return (this.quests);
  }

  public getCasinoEvents(): object{
    return (this.casino);
  }

  // Sets the URL to the Quests iCalendar
  public setQuestURL(url: string): boolean{
    if (this.validURL(url)){
      this.questURL = url;
      return (true);
    }
    return (false);
  }

  // Sets the URL to the Casino iCalendar
  public setCasinoURL(url: string): boolean{
    if (this.validURL(url)){
      this.casinoURL = url;
      return (true);
    }
    return (false);
  }

  // Adds an individual urgent quest or concert
  private addQuestEvent(event: EventObject): boolean{
    if (event){
      const uid: string = event.uid;
      const summary: string = event.summary;
      const startTime: string = event.start;
      const endTime: string = event.end;
      
      const parsedEvent = new quests.Quests({uid, summary, startTime, endTime});
      this.quests.push(parsedEvent);
      return (true);
    }
    return (false);
  }

  // Adds an individual casino event
  private addCasinoEvent(event: EventObject): boolean{
    if (event){
      const uid: string = event.uid;
      const summary: string = event.summary;
      const startTime: string = event.start;
      const endTime: string = event.end;
      
      const parsedEvent = new quests.Quests({uid, summary, startTime, endTime});
      this.casino.push(parsedEvent);
      return (true);
    }
    return (false);
  }

  // Searches for a specific event
  public searchQuests(searchTerm: string): Array<object>{
    // LOGIC: Search a separate UQ table BEFORE searching for the event
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

  // Loads Urgent Quest/Concert events from the internet into the quests array
  private async loadQuestEvents(): Promise<void>{
    let events = await iCal.iCalendar.getNetworkEvents(this.questURL);

    // Implicit casting to IndexedEventObject
    const indexedEvents = <IndexedEventObject>events;
    // Pushes events into the Quest object
    if (indexedEvents){
      for (const idx in indexedEvents){
        this.addQuestEvent(<EventObject>indexedEvents[idx]);
      }
    }
  }

  // Loads Casino events from the internet into the casino array
  private async loadCasinoEvents(): Promise<void>{
    let events = await iCal.iCalendar.getNetworkEvents(this.casinoURL);

    // Implicit casting to IndexedEventObject
    const indexedEvents = <IndexedEventObject>events;
    // Pushes events into the Casino object
    if (indexedEvents){
      for (const idx in indexedEvents){
        this.addCasinoEvent(<EventObject>indexedEvents[idx]);
      }
    }
  }

  // Initializes the urgent quest/concert events
  public async initQuestEvents(url?: string, refreshInterval?: number): Promise<void>{
    if (url) this.setQuestURL(url);
    if (refreshInterval) this.questRefreshInterval = refreshInterval;

    this.loadQuestEvents();
    console.log('Quests and Concert events have successfully loaded onto the system!');
    // Sets a timer to refresh the calendar
    //this.refreshQuestEvents();
    }

  // Initializes the casino events
  public async initCasinoEvents(url?: string, refreshInterval?: number): Promise<void>{
    if (url) this.setCasinoURL(url);
    if (refreshInterval) this.casinoRefreshInterval = refreshInterval;
    this.loadCasinoEvents();
    console.log('Casino events have successfully loaded onto the system!');
    //this.refreshCasinoEvents();
  }

  // Sets up the system to reinitialize the quest event listings
  private async refreshQuestEvents(): Promise<void>{
    this.questRefreshTimeout = setTimeout(this.loadQuestEvents, this.questRefreshInterval);
  }

  // Sets up the system to reinitialize the casino event listings
  private async refreshCasinoEvents(): Promise<void>{
    this.casinoRefreshTimeout = setTimeout(this.initCasinoEvents, this.casinoRefreshInterval);
  }
}
