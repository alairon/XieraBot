export class UTCDate{
  public getUTCString(date: Date): String{
    const UTCDate: Date = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()));
    return UTCDate.toISOString();
  }
}