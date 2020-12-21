import { Message } from 'discord.js';
import Main = require('./EventManager');
import Core = require('../../Core/Core');
import MessageManager = require('./Messages');

const fuseConfig = {
  "shouldSort": false,
  "minMatchCharLength": 2,
  "threshold": 0.2,
  "ignoreLocation": true,
  keys: [
    "summary"
  ]
};

export class Events extends Main.EventManager {
  events: object;
  refreshInterval: number;
  refresh: NodeJS.Timeout;

  constructor(url: string, refreshInterval: number){
    super(url);
    this.refreshInterval = refreshInterval;
    this.initEvents();
  }

  public getEvents(): object {
    return (this.events);
  }

  public async initEvents(): Promise<void> {
    this.events = await this.init();
    this.searchInit(this.events, fuseConfig);
    this.refreshCalendar();
  }

  public displayEvents(): void {
    console.log(this.events);
  }

  public searchQuery(query: string): object {
    return (this.searchEvents(query));
  }

    // Refreshes the calendar
    private async refreshCalendar(): Promise<void>{
      this.refresh = setTimeout(this.initEvents.bind(this), (this.refreshInterval * 3600000));
      console.log(`Quests calendar updated ${Core.UTCStrings.getTimestamp(new Date())}. Next scheduled update: ${Core.TimeStrings.totalTimeString(this.refreshInterval * 3600000)}`);
    }
  
    public resetCalendarURL(calendarID: string): void{
      let url = '';
      url = url.concat('https://calendar.google.com/calendar/ical/', calendarID, '/public/basic.ics')
      this.updateCalendar(url);
    }

    // Update the current iCal URL, then force a refresh
    private async updateCalendar(url: string): Promise<void>{
      console.log(`Updating the calendar from\n${this.getUrl()}\n${url}`);
      this.setURL(url);
      clearTimeout(this.refresh);
      this.initEvents();
    }

  public async findEvent(command: string): Promise<string>{
    const sendMsg: MessageManager.Messages = new MessageManager.Messages();
    // Test if there are any commands after 'uq'.
    //If command was empty, return the first five upcoming events
    const token = command.split(' ');
    if (!token[1]){
      const searchLimit: number = 5;
      let limit = searchLimit;
      const eventValues = Object.values(this.events);
      sendMsg.addMessage(`Here's the next few scheduled events:\n`);

      //Get the current time
      const now: number = new Date().getTime();
      for (const idx in eventValues){
        // Get the start and end time from the event
        const eventStartTime = new Date(eventValues[idx].startTime).getTime();
        const eventEndTime = new Date(eventValues[idx].endTime).getTime();
        // If the event is happening now
        if (now >= eventStartTime && now < eventEndTime){
          sendMsg.addMessage(`\n**${eventValues[idx].summary}**\`\`\`ldif\nHappening now!\nEnds in: ${Core.TimeStrings.totalTimeString(eventEndTime-now)}\`\`\`\u00A0`);
          limit--;
        }
        // If the event happens later
        else if (now < eventStartTime) {
          sendMsg.addMessage(`\n**${eventValues[idx].summary}**\`\`\`ldif\nStarts in: ${Core.TimeStrings.totalTimeString(eventStartTime-now)}\`\`\`\u00A0\u00A0`);
          limit--;
        }
        // If the event already happened, it gets nothing, not even an else block

        // Stop looping if there's already three events.
        if (limit <= 0){
          break;
        }
      }

      // If there's no upcoming events (usually due to Casra/SEGA not uploading the schedule)
      if (limit == searchLimit){
        return ('There doesn\'t seem to be any upcoming scheduled events');
      }
      return(sendMsg.getMessage());
    }

    // If there is a search term, extract it from the UQ command
    const searchTerm = command.match(/(?<=uq\s).*/mi).toString();
    // Searches the events based on user input
    if (searchTerm){
      const searchResults: object = this.searchQuery(searchTerm);
      let searchLimit = 5;
      let omittedResults = 0;

      if (Object.keys(searchResults).length == 0){
        return (`Hmmm, there doesn't seem to be anything in the schedule for \`${searchTerm}\` this time.`);
      }

      const eventValues = Object.values(searchResults);
      const now: number = new Date().getTime();

      for (const idx in Object.keys(searchResults)){
        const eventStartTime: number = new Date(eventValues[idx].item.startTime).getTime();
        const eventEndTime: number = new Date(eventValues[idx].item.endTime).getTime();

        if (searchLimit > 0){
          if (now >= eventStartTime && now < eventEndTime){
            sendMsg.addMessage(`\n**${eventValues[idx].item.summary}**\`\`\`ldif\nHappening now!\nEnds in: ${Core.TimeStrings.totalTimeString(eventEndTime-now)}\`\`\``);
            searchLimit--;
          }
          else if (now < eventStartTime){
            sendMsg.addMessage(`\n**${eventValues[idx].item.summary}**\`\`\`ldif\nStarts in: ${Core.TimeStrings.totalTimeString(eventStartTime-now)}\`\`\``);
            searchLimit--;
          }
        }
        else{
          omittedResults++;
        }
      }
      if (omittedResults > 0) {
        if (omittedResults == 1){
          sendMsg.addMessage(`\nThere's **${omittedResults}** more event related to \`${searchTerm}\` scheduled to happen soon`);
        }
        else{
          sendMsg.addMessage(`\nThere are **${omittedResults}** more events related to \`${searchTerm}\` that are scheduled to happen soon`);
        }
      }
      if (!sendMsg.isEmpty()){
        sendMsg.addHeaderMessage(`Here's a couple upcoming events that I could find based on \`${searchTerm}\``);
        sendMsg.addMessage(`\nCountdown times shown are based on ${Core.UTCStrings.getTimestamp(new Date(now))}`)
        return (sendMsg.getMessage());
      }
      else {
        return (`There doesn't seem to be any more upcoming events with \`${searchTerm}\` for this period, but be sure to check for any unscheduled events (or maybe someone will use a trigger)`);
      }
    }
    // Blame Casra for all of Xiera's issues (not Xiao)
    return ('Casra? Seriously, he never does his job when you need him to.');
  }
}
