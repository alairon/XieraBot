export class Messages {
  message: string;

  constructor(){
    this.message = '';
  }

  public isEmpty(): boolean{
    if (this.message.length > 0) return false;
    return true;
  }

  public getMessage(): string{
    return (this.message);
  }

  public addMessage(msg: string){
    this.message = this.message.concat(msg);
  }

  public addHeaderMessage(msg: string){
    this.message = msg.concat('\n', this.message);
  }

  public dateDiff(date: number): string {
    const secDate = date/1000;
    const weeks = Math.floor(secDate/604800);
    const days = Math.floor((secDate%604800)/86400);
    const hours = Math.floor(((secDate%604800)%86400)/3600);
    const minutes = Math.floor((((secDate%604800)%86400)%3600)/60);
    const seconds = Math.floor((((secDate%604800)%86400)%3600)%60);

    let dateString: string = '';

    //LOGIC: Append if the number isn't 0. Adds an 's' if the value is not one.
    if (weeks){
      dateString = dateString.concat(`${weeks} week`);
      if (weeks != 1){
        dateString = dateString.concat('s');
      }
    }
    if (days){
      //If not the first element, append a comma
      if (weeks){
        dateString = dateString.concat(', ');
      }
      dateString = dateString.concat(`${days} day`);
      if (days != 1){
        dateString = dateString.concat('s');
      }
    }
    if (hours){
      if (weeks || days){
        dateString = dateString.concat(', ');
      }
      dateString = dateString.concat(`${hours} hour`);
      if (hours != 1){
        dateString = dateString.concat('s');
      }
    } 
    if (minutes){
      if (weeks || days || hours){
        dateString = dateString.concat(', ');
      }
      dateString = dateString.concat(`${minutes} minute`);
      if (minutes != 1){
        dateString = dateString.concat('s');
      }
    }
    //Only appears if the event starts in less than an hour
    if ((!weeks && !days && !hours)){
      if (minutes){
        dateString = dateString.concat(', ');
      }
      dateString = dateString.concat(`${seconds} second`);
      if (seconds != 1){
        dateString = dateString.concat('s');
      }
    }

    return (dateString);
  }
}