import Main = require('./EventManager');
import MessageManager = require('./messages');

const fuseConfig = {
  keys: [
    "summary"
  ]
};

export class Events extends Main.EventManager{
  events: object;

  constructor(url: string, refreshInterval: number){
    super(url, refreshInterval);
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

  public async displayEvents(): Promise<string> {
    let sendMsg: MessageManager.Messages = new MessageManager.Messages();
    let results = 0;
    const eventValues = Object.values(this.events);
    sendMsg.addMessage(`Here's what you can look forward to at the casino!\n\n`);
    for (const idx in eventValues){
      const now = new Date().getTime();
      const eventStartTime = new Date(eventValues[idx].startTime).getTime();
      const eventEndTime = new Date(eventValues[idx].endTime).getTime();
      // If the event is happening now
      if (now >= eventStartTime && now < eventEndTime){
        sendMsg.addMessage(`**${eventValues[idx].summary}**\`\`\`ldif\nHappening now!\nEnds in: ${sendMsg.dateDiff(eventEndTime-now)}\n\`\`\`\n`);
        results++;
      }
      else if (now < eventStartTime) {
        sendMsg.addMessage(`**${eventValues[idx].summary}**\`\`\`ldif\nStarts in: ${sendMsg.dateDiff(eventStartTime-now)}\n\`\`\`\n`);
        results++
      }
    }
  if (results) return(sendMsg.getMessage());
  return ('Diehl doesn\'t seem to be running any events right now. ~~If you\'d like to test your luck right now, I heard Dudu wants to help upslot your equipment~~ Please check back soon!');
    }
}
