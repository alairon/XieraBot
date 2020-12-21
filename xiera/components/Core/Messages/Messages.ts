export class Messages {
  private message: string;

  // Initializes the object
  constructor(){
    this.message = '';
  }

  // Returns the message
  public getMessage(){
    return (this.message);
  }

  // Adds a message at the beginning of the string with a line break
  public addHeaderMessage(message: string): void{
    this.message = message.concat('\n' + this.message);
  }

  // Adds a message at the beginning of the string, then adds an additional line break
  public addHeaderMessageln(message: string): void{
    this.message = message.concat('\n\n' + this.message);
  }

  // Adds a message at the end of the string
  public addMessage(message: string): void{
    this.message = this.message.concat(message);
  }

  // Adds a message at the end of the string, then adds a line break
  public addMessageln(message: string): void{
    this.message = this.message.concat(message + '\n');
  }
}
