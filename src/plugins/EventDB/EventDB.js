const keys = require('./keys.json');

const UQKeys = keys.UQKeys;

for (const idx in UQKeys){
  let object = {
    "index": x,
    "name": idx[x].name,
    "tags": idx[x].tags
  }

  console.log(object);
}