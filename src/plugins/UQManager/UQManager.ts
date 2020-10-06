import http = require('https');
import fs = require('fs');
import ical = require('node-ical');

export class UQManager {
  private UQSource: string; //URL to the PSO2 UQ ICS file
  private CasinoSource: string; //URL to the PSO2 Casino ICS file
  private UQEvents: object; //Object containing the event data for Urgent Quests/Concerts
  private CasinoEvents: object; //Object containing the event data for Casino events

  constructor(UQSource: string, CasinoSource: string){
    this.UQSource = UQSource;
    this.CasinoSource = CasinoSource;
  }

  //Returns a string representing the URL to a .ics file for Urgent Quests and Concert events
  getQuestURL(): string {
    return (this.UQSource);
  }

  //Returns a string representing the URL to a .ics file for Casino events
  getCasinoURL(): string {
    return (this.CasinoSource);
  }

  //Returns an object of parsed urgent quests and concerts
  getUQEvents(): object {
    return (this.UQEvents);
  }

  //Returns an object of parsed casino events
  getCasinoEvents(): object {
    return (this.CasinoEvents);
  }

  //Sets the urgent quests and concerts into UQSource
  async setUQEvents(): Promise<void> {
    this.UQEvents = await this.loadEventCalendar(this.UQSource);
  }

  //Sets the casino events into CasinoSource
  async setCasinoEvents(): Promise<void> {
    this.CasinoEvents = await this.loadEventCalendar(this.CasinoSource);
  }

  //Downloads an iCalendar file from the internet and saves the results into a local .ics file.
  private async downloadEventCalendar(url: string, dest: string): Promise<void> {
    try{
      const icalFile = fs.createWriteStream(dest, {flags: 'w', encoding: 'utf8', autoClose: true});
      http.get(url, (response) => {
        response.pipe(icalFile);
        // Close the WriteStream upon completion
        icalFile.on('error', (err: Error) => {
          console.log(`There was a problem writing the file: ${err}`);
        });
        icalFile.on('finish', () => {
          icalFile.end();
        });
      });
    } catch (err) {
      console.error(`Hmm, I wasn't able to collect data from the intelligence bureau. ${err}`);
    }
    return;
  }

  //Reads and converts a local .ics file into JSON
  private async loadEventCalendar(source: string): Promise<object> {
    const events = await ical.async.parseFile(source);
    return (events);
  }
}
