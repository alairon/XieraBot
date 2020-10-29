export class UTCDate{
  public getISOString(date: Date): String{
    const UTCDate: Date = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()));
    return UTCDate.toISOString();
  }

  // Creates a time stamp in the ISO (YYYY-MM-DD HH:MM) date format
  public getTimestamp(date: Date): string{
    let utcDate: string = '';

    // Append year
    utcDate = utcDate.concat(date.getUTCFullYear().toString(), '-');

    // Append month. Values start from 0
    if (date.getUTCMonth() < 9){
      utcDate = utcDate.concat('0');
    }
    utcDate = utcDate.concat((date.getUTCMonth() +1).toString(), '-');

    // Append date
    if (date.getUTCDate() < 10){
      utcDate = utcDate.concat('0');
    }
    utcDate = utcDate.concat(date.getUTCDate().toString(), ' ');

    // Append hour
    if (date.getUTCHours() < 10){
      utcDate = utcDate.concat('0');
    }
    utcDate = utcDate.concat(date.getUTCHours().toString(), ':');

    // Append minutes
    if (date.getUTCMinutes() < 10){
      utcDate = utcDate.concat('0');
    }
    utcDate = utcDate.concat(date.getUTCMinutes().toString(), ':');

    // Append seconds
    if (date.getUTCSeconds() < 10){
      utcDate = utcDate.concat('0');
    }
    utcDate = utcDate.concat(date.getUTCSeconds().toString());

    return utcDate;
  }
}
