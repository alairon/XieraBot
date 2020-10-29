export class TimeStrings{
  // Returns the time in a readable format
  public totalTimeString(elapsed: number): string{
    const totalSeconds = elapsed/1000;
    const weeks = Math.floor(totalSeconds/604800);
    const days = Math.floor((totalSeconds%604800)/86400);
    const hours = Math.floor(((totalSeconds%604800)%86400)/3600);
    const minutes = Math.floor((((totalSeconds%604800)%86400)%3600)/60);
    const seconds = Math.floor((((totalSeconds%604800)%86400)%3600)%60);

    let dateString: string = '';

    // Append to the string if the value isn't 0. If the value isn't 1, add an 's'
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
