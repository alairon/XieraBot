import Main = require('./EventManager');
import Core = require('../../Core/Core');
import MessageManager = require('./Messages');

const fuseConfig = {
  keys: [
    "summary"
  ]
};

export class Events extends Main.EventManager{
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

    // Refreshes the calendar
    private async refreshCalendar(): Promise<void>{
      this.refresh = setTimeout(this.initEvents.bind(this), (this.refreshInterval * 3600000));
      console.log(`Casino calendar updated ${Core.UTCStrings.getTimestamp(new Date())}. Next scheduled update: ${Core.TimeStrings.totalTimeString(this.refreshInterval * 3600000)}`);
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

  public async displayEvents(): Promise<string> {
    let sendMsg: MessageManager.Messages = new MessageManager.Messages();
    let results = 0;
    const searchLimit: number = 5;
    const eventValues = Object.values(this.events);
    sendMsg.addMessage(`Here's what you can look forward to at the casino!\n\n`);
    for (const idx in eventValues){
      const now = new Date().getTime();
      const eventStartTime = new Date(eventValues[idx].startTime).getTime();
      const eventEndTime = new Date(eventValues[idx].endTime).getTime();
      // If the event is happening now
      if (now >= eventStartTime && now < eventEndTime){
        sendMsg.addMessage(`**${eventValues[idx].summary}**\`\`\`ldif\nHappening now!\nEnds in: ${Core.TimeStrings.totalTimeString(eventEndTime-now)}\n\`\`\`\n`);
        results++;

      }
      else if (now < eventStartTime) {
        sendMsg.addMessage(`**${eventValues[idx].summary}**\`\`\`ldif\nStarts in: ${Core.TimeStrings.totalTimeString(eventStartTime-now)}\n\`\`\`\n`);
        results++
      }

      if (results > 5){
        break;
      }
    }
  if (results) return(sendMsg.getMessage());
  return ('Diehl doesn\'t seem to be running any events right now. Please check back soon!');
    }
}
