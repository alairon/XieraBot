import ical = require('node-ical');

export class iCalendar{
  // Attempts to download an ics file from the Internet.
  // Returns an object with iCalendar values unless the resource is unreachable, in which case it returns null
  public static async getNetworkEvents(url: string): Promise<object>{
    let iCalFile: object;
    try {
      iCalFile = await ical.async.fromURL(url);
    } catch (err) {
      console.error(`An iCal file couldn't be created from ${url}\nHere's some additional info:\n${err}`);
      iCalFile = null;
    } finally {
      return (iCalFile);
    }
  }
}
