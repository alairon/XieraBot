import Core = require('../Core/Core');

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

  public createTimestamp(date: Date): String{
    return (Core.UTCStrings.getTimestamp(date));
  }
}
