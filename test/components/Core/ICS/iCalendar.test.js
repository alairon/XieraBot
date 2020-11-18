const iCalendar = require('../../../../xiera/components/Core/ICS/iCalendar').iCalendar;
const assert = require('chai').assert;

describe("iCalendar", () => {
  describe("1) Improper async usage", () => {
    describe("A) Using the function without async features", () => {
      it ("Using it without async returns an empty object", () => {
        assert.isEmpty(iCalendar.getNetworkEvents('https://horaro.org/mock/mock.ical'));
      });
      it ("An undefined value returns an empty object", () => {
        assert.isEmpty(iCalendar.getNetworkEvents(undefined));
      });
    });
  });
  describe("2) Invalid values", () => {
    describe("A) Numbers", () => {
      it ("A number returns null", async () => {
        assert.equal(await iCalendar.getNetworkEvents(1500), null);
      });
      it ("A boolean returns null", async () => {
        assert.equal(await iCalendar.getNetworkEvents(true), null);
      });
      it ("An object returns null", async () => {
        assert.equal(await iCalendar.getNetworkEvents({}), null);
      });
      it ("An undefined value returns null", async () => {
        assert.equal(await iCalendar.getNetworkEvents(undefined), null);
      });
    });
  });
});
