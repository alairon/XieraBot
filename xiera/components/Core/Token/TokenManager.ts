export class TokenManager{
  token: RegExp;
  commands: RegExp;

  // Sets up the token
  constructor(token: string, flags: string){
    // Token at the beginning of the message, with an optional space
    this.token = new RegExp(`^${token}\\s?`, flags); 
    // The text after the token.
    this.commands = new RegExp(`(?<=${token}\\s?).*`, flags);
  }

  // Returns whether the token exists in the string
  public tokenExists(input: string): boolean{
    return (this.token.test(input));
  }

  // Return the stored regular expression
  public getRegExp(): RegExp{
    return (this.token);
  }
  
  // Attempts to removes the flag.
  // Requires that token and commands be configured/instantiated
  public removeToken(input: string): string{
    let tokenlessString: RegExpMatchArray = input.match(this.commands);
    let resultString: string;
    try{
      resultString = tokenlessString[0];
    } catch (err) {
      console.error(`The token could not be removed\n${err}`);
    } finally {
      return (resultString);
    }
  }

  // Removes a mention from the string
  public removeMention(input: string): string{
    const regex = /^<@?!?\d*>/mi; //Discord mentions are in the format: <@!000000000>
    return (input.replace(regex, ''));
  }

  // Returns the first word that appears in the string
  private userAction(userInput: string): string{
    let tag: string;
    try{
      tag = userInput.split(' ', 1)[0];
    } catch(err) {
      console.error(`The tag could not be obtained\n${err}`);
      tag = '';
    } finally {
      return (tag);
    }
  }

  // Returns a string of arguments
  private getUserArguments(action: string, userInput: string): string{
    const actionRegex = new RegExp(`(?<=${action}\\s).*`, 'mi');
    const result = actionRegex.exec(userInput);

    if (result){
      return (result[0]);
    }
    return (null);
  }

  // Returns an array of the user command and any arguments afterwards
  // Should be used after removing any applicable flags
  public getUserAction(userInput: string): Array<string>{
    const action = this.userAction(userInput);

    if (action) {
      const args = this.getUserArguments(action, userInput);
      return ([action, args]);
    }
    return (null);
  }
}
