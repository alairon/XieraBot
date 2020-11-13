import https = require('https');
import fs = require('fs');
import ical = require('node-ical');
import path = require('path');
import Search = require('./Search');
import Core = require('../Core/Core');

export class EventManager {
  private icalDir: string; // PATH to the iCalendar directory
  private icalFile: string; // NAME of the .ics file
  private url: string; // URL to the .ics file
  private fuse: any; // Fuse search

  constructor(url: string){
    this.url = url;
  }

  // Returns a string representing the URL to a .ics file
  public getUrl(): string {
    return (this.url);
  }

  // Returns a string representign the path to the local .ics file
  public getIcalFile(): string {
    return (this.icalFile);
  }

  protected setURL(url: string): void {
    this.url = url;
  }

  // Initializes the ical
  protected async init(url?: string): Promise<object> {
    // If no URL was provided and no URL was set
    if (typeof(this.url) === 'undefined' && typeof(url) === 'undefined'){
      console.log(`The URL hasn't been set. Attempting to read the local database.`);
      let localResults = await this.initLocal();
      return localResults;
    }
    else{
      if (url) this.setURL(url);
      let webResults = await this.initWeb();
      return webResults;
    }
  }

  // Downloads .ics data from a link, then loads the data
  private async initWeb(): Promise<object> {
    const results = await this.loadNetworkEventCalendar();
    const calData = await this.parseEvents(results);
    const data = await this.sortByDate(calData);
    return data;
  }

  // Loads the data from a local or freshly downloaded .ics file
  private async initLocal(): Promise<object>{
    let results = await this.loadEventCalendar();
    return results;
  }

  protected searchInit(events: object, searchConfig: object){
    this.fuse = new Search.SearchManager(events, searchConfig);
  }

  protected searchEvents(searchTerm: string): object{
    return (this.fuse.searchEvents(searchTerm));
  }

  // Downloads an iCalendar file from the internet and saves the results into a local .ics file.
  private async downloadEventCalendar(): Promise<void> {
    const dest = path.join(this.icalDir, this.icalFile);

    // Create the directory
    fs.mkdir(this.icalDir, (err) => {
      if (err) {
        switch(err.code){
          case 'EEXIST':
            console.log('The directory already exists, so there\'s no need to make a new one.');
            break;
          case 'EACCES':
            console.log('I can\'t access that directory. Maybe check that I can write to it first?');
            break;
          case 'ENAMETOOLONG':
            console.log('Hate to break it to you, but the path you gave me was way too long!');
          default:
            console.log(`I don't know what that error is, maybe you can help figure it out: ${err.code}`);
            break;
        }
      }
    });

    // Open up the WriteStream
    const icalFile = fs.createWriteStream(dest, {flags: 'w', encoding: 'utf8', autoClose: true});

    // Upon opening the file
    icalFile.on('open', () => {
      console.log('Great! Now to download the data from the intelligence bureau.');
    });

    // When the file cannot be accessed
    icalFile.on('error', (err) => {
      console.log(`That's odd. I can't seem to open this file you gave me?\n${err.message}`);
      return;
    });
    
    // Attempt to download the ics into the specified file
    try{
      https.get(this.url, (response) => {
        response.pipe(icalFile);
        // Close the WriteStream upon successful completion
        icalFile.on('finish', () => {
          console.log('All done with that! Now to make the contents readable for you.');
          icalFile.end();
        });
      return;
      });
    } catch (err) {
      console.error(`Hmm, I wasn't able to collect data from the intelligence bureau.\nMessage: ${err}`);
      return;
    }
  }

  // Downloads an iCalendar from the internet and immediately parses it. Returns a parsed object.
  private async loadNetworkEventCalendar(): Promise<object>{
    if (typeof(this.url) === 'undefined'){
      console.log(`You'll need to set a URL first!`);
      return;
    }
    const webEvents = await ical.async.fromURL(this.url);
    return webEvents;
  }

  //Reads and converts a local .ics file or a buffer into JSON. Returns a parsed object.
  private async loadEventCalendar(data?: string): Promise<object> {
    if (data) {
      let events = await ical.async.parseICS(data);
      return (events);
    }

    const source = path.join(this.icalDir, this.icalFile);
    let events = await ical.async.parseFile(source);
    return (events);
  }

  // Trims the fat from the ICS object
  private async parseEvents(data: object): Promise<Array<object>> {
    let indexData: Array<object> = [];
    const eventData = <eventObject>data;
    for (const idx in eventData){
      const uid = eventData[idx].uid;
      const summary = eventData[idx].summary;
      const startTime = await this.dateToString(eventData[idx].start);
      const endTime = await this.dateToString(eventData[idx].end);
      const event = { uid, summary, startTime, endTime };
      indexData.push(event);
    }

    return indexData;
  }

  // Converts the string found in the ICS file into a JS date
  private async dateToString(icalDate: string): Promise<Date> {
    const date: Date = new Date(icalDate.toString());
    return (date);
  }

  // Generates an ISO string based on UTC
  public getUTCString(date: Date): string{
    const UTCDate: Date = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()));
    return UTCDate.toISOString();
  }

  // Sorts the events by date
  private async sortByDate(events: Array<object>): Promise<Array<object>> {
    events.sort((a: eventObject, b: eventObject) => {
      const aStartTime = a.startTime;
      const bStartTime = b.startTime;

      if (aStartTime < bStartTime) return (-1);
      if (aStartTime > bStartTime) return (1);
      return (0);
    });

    return (events);
  }
}

// TypeScript interface to let the complier know what to expect in an event object
export interface eventObject {
  [index: string]: {
    uid: string, 
    summary: string,
    start: string,
    end: string
  };
}
