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

  // Constructor
  constructor(){
    this.quests = [];
    this.casino = [];
    this.questURL = '';
    this.casinoURL = '';
  }

  // Gets the URL to the Quests iCalendar
  public getQuestURL(): string{
    return (this.questURL);
  }

  // Gets the URL to the Casino iCalendar
  public getCasinoURL(): string{
    return (this.casinoURL);
  }

  public getQuests(): void{
    console.log(this.quests);
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
  private addQuest(event: EventObject): boolean{
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
  private addCasino(event: EventObject): boolean{
    this.casino.push(event);
    return (true);
  }

  // Searches for a specific event
  public searchQuests(searchTerm: string): Array<object>{
    // LOGIC: Search a separate UQ table BEFORE searching for the event
    // If found, THEN search the event calendar
    return (null);
  }

  public searchCasino(searchTerm: string): Array<object>{
    // LOGIC: Search the event calendar directly.
    return (null);
  }

  // Tests if the URL is in the correct format. See the constant urlRegExp above.
  private validURL(url: string): boolean{
    if (urlRegExp.test(url)){
      return (true);
    }
    return (false);
  }

  // Loads the iCalendar data from a URL.
  private async loadQuestEvents(): Promise<void>{
    let events = await iCal.iCalendar.getNetworkEvents(this.questURL);

    const indexedEvents = <IndexedEventObject>events;
    if (indexedEvents){
      for (const idx in indexedEvents){
        this.addQuest(<EventObject>indexedEvents[idx]);
      }
    }
  }

  // Initializes the events
  public initQuestEvents(url: string): Promise<void>{
    this.setQuestURL(url);
    this.loadQuestEvents();
    return;
  }

  // Periodically reinitializes the calendar
  private refreshCalendar(): void{

  }
}
