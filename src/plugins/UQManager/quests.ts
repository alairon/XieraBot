import { Message } from 'discord.js';
import Main = require('./UQManager');
import MessageManager = require('./messages');

const fuseConfig = {
  "shouldSort": false,
  "minMatchCharLength": 2,
  "threshold": 0.2,
  "ignoreLocation": true,
  keys: [
    "summary"
  ]
};

export class Events extends Main.UQManager {
  events: object;

  constructor(){
    super('./ical', 'events.ics', 'https://calendar.google.com/calendar/ical/bhuq84ncb4gcuukvehrqt5iftg@group.calendar.google.com/public/basic.ics');
    this.events = {};
  }

  public getEvents(): object {
    return (this.events);
  }

  public async initEvents(): Promise<void> {
    let events = await this.init();
    this.events = events;
    this.searchInit(events, fuseConfig);
  }

  public setEvents(): void{
    let eventObject: object = this.events;
    for (const value of Object.values(eventObject)){
      console.log ([value.start, value.end, value.summary]);
    }
  }

  public displayEvents(): void {
    console.log(this.events);
  }

  public searchQuery(query: string): object {
    return (this.searchEvents(query));
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
          sendMsg.addMessage(`\n**${eventValues[idx].summary}**\`\`\`ldif\nHappening now!\nEnds in: ${sendMsg.dateDiff(eventEndTime-now)}\`\`\`\u00A0`);
          limit--;
        }
        // If the event happens later
        else if (now < eventStartTime) {
          sendMsg.addMessage(`\n**${eventValues[idx].summary}**\`\`\`ldif\nStarts in: ${sendMsg.dateDiff(eventStartTime-now)}\`\`\`\u00A0\u00A0`);
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
      let searchLimit = 10;
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
            sendMsg.addMessage(`\n**${eventValues[idx].item.summary}**\`\`\`ldif\nHappening now!\nEnds in: ${sendMsg.dateDiff(eventEndTime-now)}\`\`\``);
            searchLimit--;
          }
          else if (now < eventStartTime){
            sendMsg.addMessage(`\n**${eventValues[idx].item.summary}**\`\`\`ldif\nStarts in: ${sendMsg.dateDiff(eventStartTime-now)}\`\`\``);
            searchLimit--;
          }
        }
        else{
          omittedResults++;
        }
      }
      if (omittedResults > 0) {
        if (omittedResults == 1){
          sendMsg.addMessage(`There's **${omittedResults}** more event scheduled to happen in the future.`);
        }
        else{
          sendMsg.addMessage(`There are **${omittedResults}** more events that are scheduled to run in the future\n`);
        }
      }
      if (!sendMsg.isEmpty()){
        sendMsg.addHeaderMessage(`Here's a couple upcoming events that I could find based on \`${searchTerm}\``);
        return (sendMsg.getMessage());
      }
      else {
        return (`There doesn't seem to be any more upcoming events with \`${searchTerm}\`, but be sure to check for any unscheduled events (or maybe someone will use a trigger)`);
      }
    }
    // Blame Casra for all of Xiera's issues (not Xiao)
    return ('Casra? Seriously, he never does his job when you need him to.');
  }

  public save(): void{
    this.saveEvents(this.events);
  }
}
