const DateTime = require('luxon').DateTime;

export class TimeLocale {
  // Creates a UTC timestamp based on a specific IANA (TZ Database) time zone
  public static getTimeFromISOIANA(time: string, timeZone: string): string{
    const DateObject = DateTime.fromISO(time, {zone: timeZone});
    return (DateObject.ts);
  }
}
