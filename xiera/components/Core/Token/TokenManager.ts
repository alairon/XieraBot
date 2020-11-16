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
  
  // Removes the flag.
  public removeToken(input: string): string{
    let tokenlessString: RegExpMatchArray = input.match(this.commands);
    let resultString: string;
    try{
      resultString = tokenlessString[0];
    }catch (err){
      console.error(`The token could not be removed\n${err}`);
    } finally{
      return (resultString);
    }
  }

  // Removes a mention from the string
  public removeMention(input: string): string{
    const regex = /^<@?!?\d*>/mi;
    return (input.replace(regex, ''));
  }

  // Creates an array of searchable tags
  public createTags(input: string): Array<string>{
    if (input){
      return (input.split(' '));
    }
    else{
      return ([]);
    }
  }
}
