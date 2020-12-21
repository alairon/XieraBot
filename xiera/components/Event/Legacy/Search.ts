const Fuse = require('fuse.js');

export class SearchManager {
  private fuse: any;
  private options: object

  constructor (events: object, options: object){
    this.options = options;
    this.fuse = new Fuse(events, options);
  }

  protected getOptions(){
    return (this.options);
  }

  protected searchEvents(search: string){
    return (this.fuse.search(search));
  }
}
