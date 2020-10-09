import Main = require('./UQManager');

export class Events extends Main.UQManager {
  events: object;

  constructor(){
    super('./ical', 'events.ics', 'https://calendar.google.com/calendar/ical/q9vhte9052gcqfbqe1i84akeps@group.calendar.google.com/public/basic.ics');
    this.events = {};
  }

  getEvents(): object {
    return (this.events);
  }

  async initEvents(): Promise<void> {
    let events = await this.init();
    this.events = events;
  }

  setEvents(): void{
    let eventObject: object = this.events;
    for (const value of Object.values(eventObject)){
      console.log ([value.start, value.end, value.summary]);
    }
  }

  displayEvents(): void {
    console.log(this.events);
  }
}