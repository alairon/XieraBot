const TimeLocale = require('./TimeLocale').TimeLocale;

export class UTCStrings{
  // Returns an ISO UTC string
  public static getISOString(date: Date): string{
    const UTCDate: Date = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()));
    return (UTCDate.toISOString());
  }

  // Returns an ISO UTC string from a ISO string and an IANA time zone
  public static getISOStringWithLocale(date: string, locale: string): string{
    const UTCDate: Date = new Date(TimeLocale.getTimeFromISOIANA(date, locale));
    return (UTCDate.toISOString());
  }

  // Creates a time stamp in the ISO (YYYY-MM-DD HH:MM:SS) date format
  // Values are padded with a 0 if it does not result in a double digit number
  public static getTimestamp(date: Date): string{
    if (typeof(date) !== typeof(new Date())){
      return (null);
    }

    let timestamp: string = '';

    // Append year
    timestamp = timestamp.concat(date.getUTCFullYear().toString(), '-');

    // Append month. Values start from 0
    if (date.getUTCMonth() < 9){
      timestamp = timestamp.concat('0');
    }
    timestamp = timestamp.concat((date.getUTCMonth() +1).toString(), '-');

    // Append date
    if (date.getUTCDate() < 10){
      timestamp = timestamp.concat('0');
    }
    timestamp = timestamp.concat(date.getUTCDate().toString(), ' ');

    // Append hour
    if (date.getUTCHours() < 10){
      timestamp = timestamp.concat('0');
    }
    timestamp = timestamp.concat(date.getUTCHours().toString(), ':');

    // Append minutes
    if (date.getUTCMinutes() < 10){
      timestamp = timestamp.concat('0');
    }
    timestamp = timestamp.concat(date.getUTCMinutes().toString(), ':');

    // Append seconds
    if (date.getUTCSeconds() < 10){
      timestamp = timestamp.concat('0');
    }
    timestamp = timestamp.concat(date.getUTCSeconds().toString());

    return (timestamp);
  }

  // Creates a time stamp in the ISO (YYYY-MM-DD HH:MM) date format
  // Values are padded with a 0 if it does not result in a double digit number
  public static getShortTimestamp(date: Date): string{
    if (typeof(date) !== typeof(new Date())){
      return (null);
    }

    let timestamp: string = '';

    // Append year
    timestamp = timestamp.concat(date.getUTCFullYear().toString(), '-');

    // Append month. Values start from 0
    if (date.getUTCMonth() < 9){
      timestamp = timestamp.concat('0');
    }
    timestamp = timestamp.concat((date.getUTCMonth() +1).toString(), '-');

    // Append date
    if (date.getUTCDate() < 10){
      timestamp = timestamp.concat('0');
    }
    timestamp = timestamp.concat(date.getUTCDate().toString(), ' ');

    // Append hour
    if (date.getUTCHours() < 10){
      timestamp = timestamp.concat('0');
    }
    timestamp = timestamp.concat(date.getUTCHours().toString(), ':');

    // Append minutes
    if (date.getUTCMinutes() < 10){
      timestamp = timestamp.concat('0');
    }
    timestamp = timestamp.concat(date.getUTCMinutes().toString());
    
    return (timestamp);
  }
}
