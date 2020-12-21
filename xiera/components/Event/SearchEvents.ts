const Fuse = require('fuse.js');
const EventIndex = require('../../EventSearchIndex.json');
import { SearchEntity } from './@types/SearchEvents';

const fuseConfig: object = {
  shouldSort: false,
  minMatchCharLength: 2,
  threshold: 0.2,
  ignoreLocation: true,
  keys: [
    {name: "title", weight: 0.5},
    {name: "tags", weight: 0.4},
    {name: "alt", weight: 0.1}
  ]
};

const fuseIndexConfig: object = {
  shouldSort: true,
  minMatchCharLength: 2,
  threshold: 0.3,
  ignoreLocation: true,
  ignoreFieldNorm: false,
  keys: [
    {name: "title", weight: 0.5},
    {name: "tags", weight: 0.4},
    {name: "alt", weight: 0.1}
  ]
};

export class Search {
  private fuse: any;
  private fuseIndex: any = new Fuse(EventIndex, fuseIndexConfig);
  message: any;

  constructor(){
    this.fuse = new Fuse([], fuseConfig);
  }

  // Searches the index
  public async searchIndex(searchTerm: string): Promise<SearchEntity>{
    const results = await this.fuseIndex.search(searchTerm);
    if (results){
      return (results[0]);
    }
    console.log(`No tags available for ${searchTerm}`);
    return (null);
  }

  // Updates the Fuse search items
  public updateSearch(events: object){
    this.fuse = new Fuse(events, fuseConfig);
  }

  // Searches for a string
  public async searchEvents(searchTerm: string): Promise<object>{
    const results = await this.fuse.search(searchTerm);
    return (results);
  }
}
