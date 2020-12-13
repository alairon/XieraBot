export class Commands{
  // Returns the first word after a split
  static getActionTag(userInput: string): string{
    const tag = userInput.split(' ', 1);
    if (tag) return (tag[0]);
    return (null);
  }
}