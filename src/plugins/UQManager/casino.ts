import Main = require('./UQManager');
import MessageManager = require('./messages');

const fuseConfig = {
  keys: [
    "summary"
  ]
};

export class Events extends Main.UQManager{
  events: object;

  constructor(){
    super(null, null, 'https://calendar.google.com/calendar/ical/gkuse6kpb8hees75j47644eqmo@group.calendar.google.com/public/basic.ics');
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

  public async displayEvents(): Promise<string> {
    let sendMsg: MessageManager.Messages = new MessageManager.Messages();
    const eventValues = Object.values(this.events);
    sendMsg.addMessage(`Here's what you can look forward to at the casino!\n\n`);
    for (const idx in eventValues){
      const now = new Date().getTime();
      const eventStartTime = new Date(eventValues[idx].startTime).getTime();
      const eventEndTime = new Date(eventValues[idx].endTime).getTime();
      // If the event is happening now
      if (now >= eventStartTime && now < eventEndTime){
        sendMsg.addMessage(`**${eventValues[idx].summary}**\`\`\`ldif\nHappening now!\nEnds in: ${sendMsg.dateDiff(eventEndTime-now)}\n\`\`\`\n`);
      }
      else if (now < eventStartTime) {
        sendMsg.addMessage(`**${eventValues[idx].summary}**\`\`\`ldif\nStarts in: ${sendMsg.dateDiff(eventStartTime-now)}\n\`\`\`\n`);
      }
    }
  if (!sendMsg.isEmpty()) return(sendMsg.getMessage());
  return ('Oops! I need to get the data from Diehl.');
    }
}
