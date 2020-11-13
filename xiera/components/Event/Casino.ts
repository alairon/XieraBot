interface EventObject {
  name: string,
  summary: string,
  startTime: string,
  endTime: string,
  tags?: Array<string>
}

export class Casino{
  private name: string;
  private summary: string;
  private startTime: string;
  private endTime: string;
  private tags: Array<string>;

  constructor(event: EventObject){
    this.setName(event.name);
    this.setSummary(event.summary);
    this.setStartTime(event.startTime);
    this.setEndTime(event.endTime);
    this.tags = event.tags;
  }

  public getName(): string{
    return (this.name);
  }

  public getSummary(): string{
    return (this.summary);
  }

  public getStartTime(): string{
    return (this.startTime);
  }

  public getEndTime(): string{
    return (this.endTime);
  }

  public getTags(): Array<string>{
    return (this.tags);
  }

  public getEvent(): EventObject{
    const event: EventObject = {
      name: this.name,
      summary: this.summary,
      startTime: this.startTime,
      endTime: this.endTime,
      tags: this.tags
    }

    return (event);
  }

  public setEvent(event: EventObject): void{
    if (this.isValid(event)){
      this.name = event.name,
      this.summary = event.summary,
      this.startTime = event.startTime,
      this.endTime = event.endTime,
      this.tags = event.tags
    }
  }

  private setName(name: string): void{
    if (typeof(name) == 'string') this.name = name;
  }

  private setSummary(summary: string): void{
    if (typeof(summary) == 'string') this.summary = summary;
  }

  private setStartTime(startTime: string): void{
    if (!isNaN(Date.parse(startTime))) this.startTime = startTime;
  }

  private setEndTime(endTime: string): void{
    if (!isNaN(Date.parse(endTime))) this.endTime = endTime;
  }

  // Checks if the values in the object are valid
  public isValid(event: EventObject): boolean{
    if (typeof(event.name) !== 'string'){
      return (false);
    }
    if (typeof(event.summary) !== 'string'){
      return (false);
    }
    if (typeof(event.startTime) !== 'string' || isNaN(Date.parse(event.startTime))){
      return (false);
    }
    if (typeof(event.endTime) !== 'string' || isNaN(Date.parse(event.endTime))){
      return (false);
    }
    return (true);
  }
}
