import { EventObject } from './@types/Quests';

export class Quests{
  private title: string;
  private tags: string;
  private alt: string;
  private categoryId: number;
  private startTime: string;
  private endTime: string;

  constructor(event: EventObject){
    if (this.isValid(event)){
      this.setTitle(event.title);
      this.setCategoryId(event.categoryId);
      this.setStartTime(event.startTime);
      this.setEndTime(event.endTime);
    }
    else{
      console.log('There was an invalid value and the event was not created.');
    }
  }

  // Returns the title for the event
  public getTitle(): string{
    return (this.title);
  }

  public getTags(): string{
    return (this.tags);
  }

  public getAlt(): string{
    return (this.alt);
  }

  public getCategoryId(): number{
    return (this.categoryId);
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
      title: this.title,
      tags: this.tags,
      alt: this.alt,
      categoryId: this.categoryId,
      startTime: this.startTime,
      endTime: this.endTime
    }
    return (event);
  }

  // Sets the "title" for the event
  private setTitle(title: string): void{
    if (typeof(title) == 'string') this.title = title;
  }

  // Sets the "type" for the event
  private setCategoryId(categoryId: number): void{
    if (typeof(categoryId) == 'number') this.categoryId = categoryId;
  }

  // Sets the starting time of the event after checking if it's in a valid date format
  private setStartTime(startTime: string): void{
    if (!isNaN(Date.parse(startTime))) this.startTime = startTime;
  }

  // Sets the end time of the event after checkign if it's in a valid date format
  private setEndTime(endTime: string): void{
    if (!isNaN(Date.parse(endTime))) this.endTime = endTime;
  }

  // Adds indexing data to the quest object
  public addIndexData(tags: string, alt: string){
    this.tags = tags;
    this.alt = alt;
  }

  // Checks if the values in the object are valid
  // Returns if any values are the wrong type
  public isValid(event: EventObject): boolean{
    // Expected type: string
    if (typeof(event.title) !== 'string' || event.title === ''){
      return (false);
    }
    // Expected type: string
    if (typeof(event.categoryId) !== 'number' || isNaN(event.categoryId)){
      return (false);
    }
    // Expected type: object (Date)
    if (typeof(event.startTime) !== 'string' || isNaN(Date.parse(event.startTime))){
      console.log(event.startTime);
      return (false);
    }
    // Expected type: object (Date)
    if (typeof(event.endTime) !== 'string' || isNaN(Date.parse(event.endTime))){
      return (false);
    }
    return (true);
  }
}
