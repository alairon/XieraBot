interface EventObject {
  uid: string,
  summary: string,
  startTime: string,
  endTime: string,
  tags?: Array<string>
}

interface QueryObject {
  Quests: {
    uid: string,
    summary: string,
    startTime: string,
    endTime: string
  }
}

export class Quests{
  private uid: string;
  private summary: string;
  private startTime: string;
  private endTime: string;

  constructor(event: EventObject){
    if (this.isValid(event)){
      this.setID(event.uid);
      this.setSummary(event.summary);
      this.setStartTime(event.startTime);
      this.setEndTime(event.endTime);
    }
    else{
      console.log('There was an invalid value and the event was not created.');
    }
  }

  // Returns the name of the event
  public getID(): string{
    return (this.uid);
  }

  // Returns the summary for the event
  public getSummary(): string{
    return (this.summary);
  }

  // Returns the start time for the event
  public getStartTime(): string{
    return (this.startTime);
  }

  // Returns the end tie for the event
  public getEndTime(): string{
    return (this.endTime);
  }

  // Returns the entire event as an object
  public getEvent(): EventObject{
    const event: EventObject = {
      uid: this.uid,
      summary: this.summary,
      startTime: this.startTime,
      endTime: this.endTime
    }

    return (event);
  }

  // Sets the event object
  public setEvent(): void{

  }

  // Sets the name for the event after checking if the value entred is the right type
  private setID(uid: string): void{
    if (typeof(uid) == 'string') this.uid= uid;
  }

  // Sets the "summary" for the event after checking if the value entered is the right type
  private setSummary(summary: string): void{
    if (typeof(summary) == 'string') this.summary = summary;
  }

  // Sets the starting time of the event after checking if it's in a valid date format
  private setStartTime(startTime: string): void{
    if (!isNaN(Date.parse(startTime))) this.startTime = startTime;
  }

  // Sets the end time of the event after checkign if it's in a valid date format
  private setEndTime(endTime: string): void{
    if (!isNaN(Date.parse(endTime))) this.endTime = endTime;
  }

  // Checks if the values in the object are valid
  // Returns if any values are the wrong type
  public isValid(event: EventObject): boolean{
    // Expected type: string
    if (typeof(event.uid) !== 'string' || event.uid === ''){
      return (false);
    }
    // Expected type: string
    if (typeof(event.summary) !== 'string' || event.summary === ''){
      return (false);
    }
    // Expected type: object (Date)
    if (typeof(event.startTime) !== 'object' || isNaN(Date.parse(event.startTime))){
      return (false);
    }
    // Expected type: object (Date)
    if (typeof(event.endTime) !== 'object' || isNaN(Date.parse(event.endTime))){
      return (false);
    }
    return (true);
  }
}
