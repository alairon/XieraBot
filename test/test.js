//require('./components/events/events.test');

const toTest = [
  ["TimeStrings", "./components/Core/Date/TimeStrings.test"]
];

for (const idx in toTest){
  console.log(`Testing: ${toTest[idx][0]}`);
  require(toTest[idx][1]);
}