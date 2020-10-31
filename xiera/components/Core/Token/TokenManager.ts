export class TokenManager{
  // Static: removes the flag. Does not require an instanced class
  public static removeToken(input: string, regex: RegExp): string{
    return (input.match(regex)[0]);
  }

  public static removeMention(input: string): string{
    const regex = /^<@?!?\d*>/mi;
    return (input.replace(regex, ''));
  }

  public static createTags(input: string): Array<string>{
    if (input){
      return (input.split(' '));
    }
    else{
      return ([]);
    }
  }
}
