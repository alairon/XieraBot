import quests = require('./Quests');
import casino = require('./Casino');
import WebJSON = require('../Network/WebJSON');
import Search = require('./SearchEvents');
import UTCStrings = require('../Core/Date/UTCStrings');
import { Messages } from '../Core/Messages/Messages';
import { TimeStrings } from '../Core/Date/TimeStrings';
import { EventObject, IndexedEventObject, IndexedQueryEventObject, SearchEntity, SearchIndexEntity } from './@types/Events';
import { start } from 'repl';

// Regular expression for URLs
// Format: http(s):// ...
const urlRegExp = /https?:\/\/.*/mi;

export class Events{
  private quests: Array<object>;
  private casino: Array<object>;
  private eventURL: string;
  private questsSearch: Search.Search;
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
  public getEvents(): string{
    return (JSON.stringify(this.quests));
  }
  
  // Provides the contents from the Casino array
  public getCasinoEvents(): string{
    console.log(JSON.stringify(this.casino));
    return (JSON.stringify(this.casino));
  }

  // Sets the URL
  private setURL(url: string): boolean{
    if (this.validURL(url)){
      this.eventURL = url;
      return (true);
    }
    return (false);
  }

  // Clears the stored quest and casino arrays.
  private clearEvents(): void{
    this.quests = [];
    this.casino = [];
  }

  // Adds an individual urgent quest or concert
  private addEvent(event: EventObject, searchIndex: SearchEntity): void{
    if (event){
      const title: string = event.title;
      const categoryId: number = event.categoryId;
      const startTime: string = event.startTime;
      const endTime: string = event.endTime;
      
      const parsedEvent = new quests.Quests({title, categoryId, startTime, endTime});
      if (searchIndex){
        parsedEvent.addIndexData(searchIndex.item.tags, searchIndex.item.alt);
      }
      this.quests.push(parsedEvent);
    }
  }

  // Adds an individual casino event
  private addCasinoEvent(event: EventObject): boolean{
    if (event){
      const title: string = event.title;
      const categoryId: number = event.categoryId;
      const startTime: string = event.startTime;
      const endTime: string = event.endTime;
      
      const parsedEvent = new casino.Casino({title, categoryId, startTime, endTime});
      this.casino.push(parsedEvent);
      return (true);
    }
    return (false);
  }

  // Tests if the URL is in the correct format. See the constant urlRegExp above.
  private validURL(url: string): boolean{
    if (urlRegExp.test(url)){
      return (true);
    }
    return (false);
  }

  private async sortEvents(EventData: Array<object>): Promise<Array<object>>{
    const events = EventData;
    events.sort((a: EventObject, b: EventObject) => {
      const aStartTime = a.startTime;
      const bStartTime = b.startTime;

      if (aStartTime < bStartTime) return (-1);
      if (aStartTime > bStartTime) return (1);
      return (0);
    });

    return (events);
  }

  // Downloads a JSON from a specific URL
  private async downloadEvents(): Promise<object>{
    const events = await WebJSON.WebJSON.getJSON(this.eventURL);
    return (events);
  }

  public async initEvents(url?: string, refreshInterval?: number): Promise<void>{
    if (url) {
      if (!this.setURL(url)){
        console.log('[SYSTEM] The URL isn\'t valid');
        return (null);
      }
    }
    if (refreshInterval > 1000){
      this.refreshInterval = refreshInterval;
      console.log(`[SYSTEM] Updated the refresh interval: Next refresh expected in: ${TimeStrings.totalTimeString(refreshInterval)}`);
    }
      

    // Load the events
    const ScheduleEvents: IndexedEventObject = <IndexedEventObject>(await this.downloadEvents());
    this.questsSearch = new Search.Search();

    if (!ScheduleEvents){
      return (null);
    }

    //Insert the events into the appropriate array
    for (const idx in ScheduleEvents){
      // Find the tags from the UQ table, if any
      let searchIndex: SearchEntity = await this.questsSearch.searchIndex(ScheduleEvents[idx].title);

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
            this.addEvent(eventData, searchIndex);
            break;
          case 11: // Casino Boosts
            this.addCasinoEvent(eventData);
            break;
          default:
            // All other event types
            console.log(`===== UNDEFINED EVENT =====\n${eventData}\n===========================`);
            this.addEvent(eventData, searchIndex);
            break;
        }
      }
    }

    // Sort the data
    this.quests = await this.sortEvents(this.quests);
    this.casino = await this.sortEvents(this.casino);

    // Initializes the search for Events
    const questStrings = JSON.parse(JSON.stringify(this.quests));
    this.questsSearch.updateSearch(questStrings);

    // Starts the timeout for this process to be repeated, clears the existing one if present
    if (this.eventRefreshTimeout) clearTimeout(this.eventRefreshTimeout);
    this.eventRefreshTimeout = setTimeout( async () => {this.clearEvents(); this.initEvents();}, this.refreshInterval);
    console.log(`[SYSTEM] Events have been updated. The next scheduled update is in: ${TimeStrings.totalTimeString(this.refreshInterval)}`)
  }

  // Searches for the events
  public async searchEvents(searchTerm: string): Promise<string>{
    const results = await this.questsSearch.searchEvents(searchTerm);

    return (this.generateSearchResultsMessage(<SearchIndexEntity>results, searchTerm));
  }

  private generateSearchResultsMessage(searchResults: SearchIndexEntity, searchTerm: string): string{
    const MessageResponse = new Messages();
    let now = new Date().getTime();
    const maxResults = 5;
    let results = 0;
    let omittedResults = 0;

    if (searchResults){
      for (const idx in searchResults){
        const eventStartTime = new Date(searchResults[idx].item.startTime).getTime();
        const eventEndTime = new Date(searchResults[idx].item.endTime).getTime();

        if (results < maxResults){
          if ((eventStartTime >= now) && (eventEndTime<= now)){
            MessageResponse.addMessageln(`**${searchResults[idx].item.title}**\`\`\`ldif\nHappening now!\nEnds in: ${TimeStrings.totalTimeString(eventEndTime-now)}\`\`\``);
            results++;
          }
          else if (now < eventStartTime){
            MessageResponse.addMessageln(`**${searchResults[idx].item.title}**\`\`\`ldif\nStarts in: ${TimeStrings.totalTimeString(eventStartTime-now)}\`\`\``);
            results++;
          }
        }
        else{
          omittedResults++;
        }
      }

      if (results == 0){
        MessageResponse.addMessageln(`There doesn't seem to be any upcoming events related to \`${searchTerm}\` for this time period.`);
      }
      else{
        MessageResponse.addHeaderMessageln(`Here's the next couple of events that I could find based on \`${searchTerm}\``);
        if (omittedResults > 0){
          if (omittedResults == 1){
            MessageResponse.addMessageln(`There's **${omittedResults}** more event related to ${searchTerm} scheduled to happen soon`);
          }
          else{
            MessageResponse.addMessageln(`There's **${omittedResults}** more events related to ${searchTerm} scheduled to happen soon`);
          }
        }
        MessageResponse.addMessage(`These countdown times shown were based on ${UTCStrings.UTCStrings.getTimestamp(new Date(now))}`);
      }
    }
    else {
      MessageResponse.addMessageln(`There doesn't seem to be any results showing up for \`${searchTerm}\`.`);
    }

    // Return the message
    return (MessageResponse.getMessage());
  }

  public async searchUpcomingEvents(): Promise<string>{
    const MessageResponse = new Messages();
    const maxResults = 5;
    let results = 0;
    const now = new Date().getTime();
    const data = <IndexedQueryEventObject>this.quests;

    for (const idx in data){
      const eventStartTime = new Date(data[idx].startTime).getTime();
      const eventEndTime = new Date(data[idx].endTime).getTime();
      if (results < maxResults){
        if ((eventStartTime >= now) && (eventEndTime<= now)){
          MessageResponse.addMessageln(`**${data[idx].title}**\`\`\`ldif\nHappening now!\nEnds in: ${TimeStrings.totalTimeString(eventEndTime-now)}\`\`\``);
          results++;
        }
        else if (now < eventStartTime){
          MessageResponse.addMessageln(`**${data[idx].title}**\`\`\`ldif\nStarts in: ${TimeStrings.totalTimeString(eventStartTime-now)}\`\`\``);
          results++;
        }
      }
      else{
        break;
      }
    }

    if (results > 0){
      if (results == 1){
        MessageResponse.addHeaderMessageln(`Here's the last scheduled event:`);
      }
      else {
        MessageResponse.addHeaderMessageln(`Here's the next few scheduled events:`);
      }
      if (results < maxResults){
        MessageResponse.addMessageln(`That's all I could find for this week! Hopefully Casra will give me the intel - in a neat, organized package for once!`);
      }
      MessageResponse.addMessage(`These countdown times shown were based on ${UTCStrings.UTCStrings.getTimestamp(new Date(now))}`);
    }
    else{
      MessageResponse.addMessage(`There doesn't seem to be any upcoming events. I can feel Casra dumping a large unorganized pile of events on me any moment now...`)
    }

    return (MessageResponse.getMessage());
  }

  public async searchUpcomingCasinoEvents(): Promise<string>{
    const MessageResponse = new Messages();
    const maxResults = 5;
    let results = 0;
    const now = new Date().getTime();
    const data = <IndexedQueryEventObject>this.casino;

    for (const idx in data){
      const eventStartTime = new Date(data[idx].startTime).getTime();
      const eventEndTime = new Date(data[idx].endTime).getTime();
      if (results < maxResults){
        if ((eventStartTime >= now) && (eventEndTime<= now)){
          MessageResponse.addMessageln(`**${data[idx].title}**\`\`\`ldif\nHappening now!\nEnds in: ${TimeStrings.totalTimeString(eventEndTime-now)}\`\`\``);
          results++;
        }
        else if (now < eventStartTime){
          MessageResponse.addMessageln(`**${data[idx].title}**\`\`\`ldif\nStarts in: ${TimeStrings.totalTimeString(eventStartTime-now)}\`\`\``);
          results++;
        }
      }
      else{
        break;
      }
    }

    if (results > 0){
      if (results == 1){
        MessageResponse.addHeaderMessageln(`Here's the last scheduled event:`);
      }
      else {
        MessageResponse.addHeaderMessageln(`Here's the next few scheduled events:`);
      }
      if (results < maxResults){
        MessageResponse.addMessageln(`That's all I could find. Hopefully Diehl will provide an update soon!`);
      }
      MessageResponse.addMessage(`These countdown times shown were based on ${UTCStrings.UTCStrings.getTimestamp(new Date(now))}`);
    }
    else{
      MessageResponse.addMessage(`There doesn't seem to be any special boosts going on at the casino right now. Please check back later!`)
    }


    return (MessageResponse.getMessage());
  }
}
