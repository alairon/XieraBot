import quests = require('./Quests');
import casino = require('./Casino');
import WebJSON = require('../Network/WebJSON');
import Search = require('./SearchEvents');
import UTCStrings = require('../Core/Date/UTCStrings');
import { Messages } from '../Core/Messages/Messages';
import { TimeStrings } from '../Core/Date/TimeStrings';
import { EventObject, IndexedEventObject, IndexedQueryEventObject, SearchEntity, SearchIndexEntity } from './@types/Events';
import { MessageEmbed } from 'discord.js';

// Regular expression for URLs
// Format: http(s):// ...
const urlRegExp = /https?:\/\/.*/mi;

export class Events{
  private quests: Array<object>;
  private casino: Array<object>;
  private eventURL: string;
  private eventHTTPConfig: object;
  private questsSearch: Search.Search;
  private refreshInterval: number;
  private overrideRefreshInterval: number;
  private eventRefreshTimeout: NodeJS.Timeout;

  // Constructor
  constructor(){
    this.quests = [];
    this.casino = [];
    this.eventURL = null;
    this.eventHTTPConfig = null;
    this.refreshInterval = 10800000; // Default: 3 hours
    this.overrideRefreshInterval = 3600000; // 1 hour
  }

  // Returns the URL to where the JSON is located
  public getEventURL(): string{
    return (this.eventURL);
  }

  // Returns the HTTP configuration for where the JSON is located
  public getEventHTTPConfig(): object{
    return (this.eventHTTPConfig);
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

  // Sets the HTTP configuration
  private setHTTPConfig(config: object): void{
    this.eventHTTPConfig = config;
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
    if (this.eventURL) {
      const events = await WebJSON.WebJSON.getJSON(this.eventURL);
      return (events);
    }
    const events = await WebJSON.WebJSON.getJSON(this.eventHTTPConfig);
    return (events);
  }

  public async initEvents(options?: string | object, refreshInterval?: number): Promise<void>{
    if (options){
      if (typeof(options) == 'string') {
        const url = <string>options;
        if (!this.setURL(url)){
          console.log('[EVENTS] The URL isn\'t valid');
          return (null);
        }
      }
      else {
        this.setHTTPConfig(options);
      }
    }
    if (refreshInterval * 3600000 > 1000){
      this.refreshInterval = refreshInterval * 3600000; // in hours
      console.log(`[EVENTS] Updated the refresh interval to: ${TimeStrings.totalTimeString(refreshInterval * 3600000)}`);
    }

    // Load the events
    const ScheduleEvents: IndexedEventObject = <IndexedEventObject>(await this.downloadEvents());
    this.questsSearch = new Search.Search();

    if (!ScheduleEvents){
      return (null);
    }

    let uqCounter = 0; // Event ID 9
    let concertCounter = 0; // Event ID 10
    let casinoCounter = 0; // Event ID 11
    let leagueCounter = 0; // Event ID 12
    let otherCounter = 0; // Other IDs
    let skippedCounter = 0; // Skipped Events
    const now = Date.now();

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

        // Skip the current event if it has already passed
        if (now > new Date(eventData.endTime).getTime()) {
          skippedCounter++;
          continue;
        }

        switch(ScheduleEvents[idx].categoryId){
          case 9: // Urgent Quests
            this.addEvent(eventData, searchIndex);
            uqCounter++;
            break;
          case 10: // Live Concerts
            this.addEvent(eventData, searchIndex);
            concertCounter++;
            break;
          case 11: // Casino Boosts
            this.addCasinoEvent(eventData);
            casinoCounter++;
            break;
          case 12: // ARKS League
            this.addEvent(eventData, searchIndex);
            leagueCounter++;
            break;
          default:
            // All other event types
            console.log(`===== UNDEFINED EVENT =====\nEvent: ${eventData.title}\nID: ${eventData.categoryId}\n===========================`);
            this.addEvent(eventData, searchIndex);
            otherCounter++;
            break;
        }
      }

    }

    console.log(`===== Event Summary =====
    Urgent Quests: ${uqCounter}
    Concerts: ${concertCounter}
    Casino Boosts: ${casinoCounter}
    ARKS League: ${leagueCounter}
    Other Events: ${otherCounter}
    Events Skipped: ${skippedCounter}\n=========================`);

    // Sort the data
    this.quests = await this.sortEvents(this.quests);
    this.casino = await this.sortEvents(this.casino);

    // Initializes the search for Events
    const questStrings = JSON.parse(JSON.stringify(this.quests));
    this.questsSearch.updateSearch(questStrings);

    // Starts the timeout for this process to be repeated, clears the existing one if present
    if (this.eventRefreshTimeout) clearTimeout(this.eventRefreshTimeout);

    // Sets up when the bot should fetch the next update
    if ((uqCounter + concertCounter + leagueCounter + otherCounter) < 10){
      this.eventRefreshTimeout = setTimeout(async () => {this.clearEvents(); this.initEvents();}, this.overrideRefreshInterval);
      console.log(`[EVENTS] There is a shortage of events, presumably due to the current schedule ending soon.`);
      console.log(`[EVENTS] Temporarily overriding the configured refresh interval to force an update in: ${TimeStrings.totalTimeString(this.overrideRefreshInterval)}`);
    }
    else {
      this.eventRefreshTimeout = setTimeout(async () => {this.clearEvents(); this.initEvents();}, this.refreshInterval);
      console.log(`[EVENTS] Events have been updated. The next scheduled update is in: ${TimeStrings.totalTimeString(this.refreshInterval)}`);
    }
  }

  // Searches for the events
  public async searchEvents(searchTerm: string, embedFlag?: boolean): Promise<string|MessageEmbed>{
    const results = await this.questsSearch.searchEvents(searchTerm);

    if (embedFlag){
      return (this.generateSearchResultsMessageEmbed(<SearchIndexEntity>results, searchTerm));
    }
    return (this.generateSearchResultsMessage(<SearchIndexEntity>results, searchTerm));
  }

  private generateSearchResultsMessage(searchResults: SearchIndexEntity, searchTerm: string): string{
    const MessageResponse = new Messages();
    let now = Date.now();
    const maxResults = 5;
    let results = 0;
    let omittedResults = 0;

    if (searchResults){
      for (const idx in searchResults){
        const eventStartTime = new Date(searchResults[idx].item.startTime).getTime();
        const eventEndTime = new Date(searchResults[idx].item.endTime).getTime();

        if (results < maxResults){
          if ((now >= eventStartTime) && (now <= eventEndTime)){
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
            MessageResponse.addMessageln(`There's **${omittedResults}** more event related to \`${searchTerm}\` scheduled to happen soon`);
          }
          else{
            MessageResponse.addMessageln(`There's **${omittedResults}** more events related to \`${searchTerm}\` scheduled to happen soon`);
          }
        }
        MessageResponse.addMessage(`These countdown times shown were based on ${UTCStrings.UTCStrings.getTimestamp(new Date(now))} UTC`);
      }
    }
    else {
      MessageResponse.addMessageln(`There doesn't seem to be any results showing up for \`${searchTerm}\`.`);
    }

    // Return the message
    return (MessageResponse.getMessage());
  }

  private generateSearchResultsMessageEmbed(searchResults: SearchIndexEntity, searchTerm: string): MessageEmbed{
    const embed = new MessageEmbed();
    let now = Date.now();
    const maxResults = 5;
    let results = 0;
    let omittedResults = 0;

    embed.setTitle('Event Search Results');
    embed.setColor('#da79b1');
    embed.setTimestamp();

    if (searchResults){
      for (const idx in searchResults){
        const eventStartTime = new Date(searchResults[idx].item.startTime).getTime();
        const eventEndTime = new Date(searchResults[idx].item.endTime).getTime();

        if (results < maxResults){
          if ((now >= eventStartTime) && (now <= eventEndTime)){
            embed.addField(`__${searchResults[idx].item.title}__`, `**This event is currently active!**\nEnds in ${TimeStrings.totalTimeString(eventEndTime-now)}\n\u200B`);
            results++;
          }
          else if (((eventStartTime-now) < 900000) && (now < eventEndTime)){
            embed.addField(`__${searchResults[idx].item.title}__`, `**This event will start soon!**\nStarts in ${TimeStrings.totalTimeString(eventEndTime-now)}\n\u200B`);
          }
          else if (now < eventStartTime){
            embed.addField(`__${searchResults[idx].item.title}__`, `Starts in ${TimeStrings.totalTimeString(eventStartTime-now)}\n\u200B`);
            results++;
          }
        }
        else{
          omittedResults++;
        }
      }

      if (results == 0){
        embed.setDescription(`There doesn't seem to be any upcoming events related to \`${searchTerm}\` for this time period.`);
      }
      else{
        embed.setDescription(`Thanks for waiting! Here's what I could find for: \`${searchTerm}\``);
        if (omittedResults > 0){
          if (omittedResults == 1){
            embed.setDescription(`Thanks for waiting! Here's what I could find for: \`${searchTerm}\`. There's also **${omittedResults}** more result for \`${searchTerm}\` that is scheduled to happen soon`);
          }
          else{
            embed.setDescription(`Thanks for waiting! Here's what I could find for: \`${searchTerm}\`. There's also **${omittedResults}** more results for \`${searchTerm}\` that are scheduled to happen soon`);
          }
        }
      }
    }
    else {
      embed.setDescription(`There doesn't seem to be any results for \`${searchTerm}\`.`);
    }

    // Return the message
    return (embed);
  }

  public async searchUpcomingEvents(): Promise<string>{
    const MessageResponse = new Messages();
    const maxResults = 5;
    let results = 0;
    const now = Date.now();
    const data = <IndexedQueryEventObject>this.quests;

    for (const idx in data){
      const eventStartTime = new Date(data[idx].startTime).getTime();
      const eventEndTime = new Date(data[idx].endTime).getTime();
      if (results < maxResults){
        if ((now >= eventStartTime) && (now <= eventEndTime)){
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
      MessageResponse.addMessage(`These countdown times shown were based on ${UTCStrings.UTCStrings.getTimestamp(new Date(now))} UTC`);
    }
    else{
      MessageResponse.addMessage(`There doesn't seem to be any upcoming events. I can feel Casra dumping a large unorganized pile of events on me any moment now...`)
    }

    return (MessageResponse.getMessage());
  }

  public async searchUpcomingEventsEmbed(): Promise<MessageEmbed>{
    const embed = new MessageEmbed();
    const maxResults = 5;
    let results = 0;
    let activeUQ = false;
    const now = Date.now();
    const data = <IndexedQueryEventObject>this.quests;

    embed.setColor('#da79b1');
    embed.setTitle('Upcoming Events');
    embed.setTimestamp();

    for (const idx in data){
      const eventStartTime = new Date(data[idx].startTime).getTime();
      const eventEndTime = new Date(data[idx].endTime).getTime();
      if (results < maxResults){
        // An active event
        if ((now >= eventStartTime) && (now <= eventEndTime)){
          switch(data[idx].categoryId){
            case 9:
              embed.setColor('#da0000');
              embed.addField(`__${data[idx].title}__`, `**This is an active Urgent Quest!**\nEnds in ${TimeStrings.totalTimeString(eventEndTime-now)}\n\n`);
              embed.setFooter('Good luck out there, ARKS!');
              activeUQ = true;
              break;
            case 10:
              if (!activeUQ) {
                embed.setColor('#007900');
                embed.setTitle('Live Concert!');
                embed.setFooter('KOI☆恋！');
              }
              embed.addField(`__${data[idx].title}__`, `**There is a live concert happening now!**\nEnds in ${TimeStrings.totalTimeString(eventEndTime-now)}\n\u200B`);
              break;
            case 12:
              if (!activeUQ){
                embed.setTitle('Active ARKS League');
                embed.setFooter('Good luck, operatives!');
              }
              embed.addField(`__${data[idx].title}__`, `**The ARKS League is currently active!**\nEnds in ${TimeStrings.totalTimeString(eventEndTime-now)}\n\u200B`);
              break;
            default:
              if (!activeUQ){
                embed.setTitle('Active Event');
              }
              embed.addField(`__${data[idx].title}__`, `> **This event is in progress!**\n> Ends in ${TimeStrings.totalTimeString(eventEndTime-now)}\n\u200B`);
          }
          results++;
        }
        // An upcoming event within 15 minutes of it starting
        else if (((eventStartTime-now) < 900000) && (now < eventEndTime)){
          switch(data[idx].categoryId){
            case 9:
              embed.setColor('#da0000');
              embed.setFooter('Be sure to check your classes/loadouts and don\'t forget your buffs!');
              embed.addField(`__${data[idx].title}__`, `**This urgent quest will start soon!**\nStarts in ${TimeStrings.totalTimeString(eventStartTime-now)}\n\u200B`);
              activeUQ = true;
              break;
            case 10:
              if (!activeUQ) {
                embed.setColor('#007900');
                embed.setFooter('Be prepared for an urgent quest right after!');
              }
              embed.addField(`__${data[idx].title}__`, `**This concert will start soon!**\nStarts in ${TimeStrings.totalTimeString(eventStartTime-now)}\n\u200B`);
              break;
            case 12:
              embed.addField(`__${data[idx].title}__`, `**The league will start soon!**\nStarts in ${TimeStrings.totalTimeString(eventStartTime-now)}\n\u200B`);
            default:
              embed.addField(`__${data[idx].title}__`, `**This event will start soon!**\nStarts in ${TimeStrings.totalTimeString(eventStartTime-now)}\n\u200B`);
              break;
          }
          results++;
        }
        // An upcoming event
        else if (now < eventStartTime){
          embed.addField(`__${data[idx].title}__`, `Starts in ${TimeStrings.totalTimeString(eventStartTime-now)}\n\u200B`);
          results++;
        }
      }
      else{
        break;
      }
    }

    if (results > 0){
      if (results == 1){
        embed.setDescription(`Here's the last scheduled event`);
      }
      else if (results < maxResults){
        embed.setDescription(`Here's all the events I could find! Hopefully Casra will give me the intel in a neat, organized package for once!`);
      }
      else {
        embed.setDescription(`Here's the next few scheduled events`);
      }
    }
    else{
      embed.setDescription(`There doesn't seem to be any upcoming events. I can feel Casra dumping a large unorganized pile of events on me any moment now...`)
    }

    return (embed);
  }

  public async searchUpcomingCasinoEvents(): Promise<string>{
    const MessageResponse = new Messages();
    const maxResults = 5;
    let results = 0;
    const now = Date.now();
    const data = <IndexedQueryEventObject>this.casino;

    for (const idx in data){
      const eventStartTime = new Date(data[idx].startTime).getTime();
      const eventEndTime = new Date(data[idx].endTime).getTime();
      if (results < maxResults){
        if ((now >= eventStartTime) && (now <= eventEndTime)){
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
      MessageResponse.addMessage(`These countdown times shown were based on ${UTCStrings.UTCStrings.getTimestamp(new Date(now))} UTC`);
    }
    else{
      MessageResponse.addMessage(`There doesn't seem to be any boosts at the casino for now. Hopefully Diehl will provide an update soon!`);
    }

    return (MessageResponse.getMessage());
  }

  // Generates an embed containing information about casino boosts
  public async searchUpcomingCasinoEventsEmbed(): Promise<MessageEmbed>{
    const embed = new MessageEmbed();
    const maxResults = 5;
    let results = 0;
    const now = Date.now();
    const data = <IndexedQueryEventObject>this.casino;

    for (const idx in data){
      const eventStartTime = new Date(data[idx].startTime).getTime();
      const eventEndTime = new Date(data[idx].endTime).getTime();

      if (results < maxResults){
        if ((now >= eventStartTime) && (now <= eventEndTime)){
          embed.addField(`__${data[idx].title}__`, `**Currently in progress!**\nEnds in ${TimeStrings.totalTimeString(eventEndTime-now)}\n\u200B`);
          results++;
        }
        else if (now < eventStartTime){
          embed.addField(`__${data[idx].title}__`, `Starts in ${TimeStrings.totalTimeString(eventStartTime-now)}\n\u200B`);
          results++;
        }
      }
      else{
        break;
      }
    }

    if (results > 0){
      if (results == 1){
        embed.setDescription(`Here's the last scheduled casino event. Hopefully Diehl wil provide an update soon!`);
      }
      else if (results < maxResults){
        embed.setDescription(`These are the last few scheduled casino events. Hopefully Diehl will provide an update soon!`);
      }
      else {
        embed.setDescription(`Here's the next few scheduled boosts:`);
      }
    }
    else{
      embed.setDescription(`There doesn't seem to be any boosts going on at the casino right now. Hopefully Diehl will provide an update soon!`);
    }

    embed.setColor('#da79b1');
    embed.setTitle('Casino Boosts');
    embed.setTimestamp();

    return (embed);
  }
}
