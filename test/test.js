//require('./components/events/events.test');

const toTest = [
  // [Name of function to be tested, Testing file location]
  ["TimeStrings", "./components/Core/Date/TimeStrings.test"]
];

for (const idx in toTest){
  if (toTest[idx].length < 2) continue; // Skips if there are fewer than two keys in an index
  console.log(`Testing: ${toTest[idx][0]}`);
  require(toTest[idx][1]);
}