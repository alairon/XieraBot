const { timeStamp } = require('console');

const assert = require('chai').assert;
const TimeStrings = require('../../../../xiera/components/Core/Date/TimeStrings').TimeStrings;

describe("TimeStrings", () => {
  describe("1) Invalid param types", () => {
    describe("A) Null/Undefined/NaN", () => {
      it ("null returns null", () => {
        assert.isNull(TimeStrings.totalTimeString(null));
      });
      it ("undefined returns null", () => {
        assert.isNull(TimeStrings.totalTimeString(undefined));
      });
      it ("NaN returns '0 seconds'", () => {
        assert.equal(TimeStrings.totalTimeString(NaN), "0 seconds");
      });
    });
    describe("B) Strings", () => {
      it ("'60000' returns null", () => {
        assert.isNull(TimeStrings.totalTimeString('60000'));
      });
      it ("'60000e' returns null", () => {
        assert.isNull(TimeStrings.totalTimeString('60000e'));
      });
    });
    describe("C) Objects", () => {
      it ("Arrays return null", () => {
        assert.isNull(TimeStrings.totalTimeString([1000]));
      });
      it ("Objects return null", () => {
        assert.isNull(TimeStrings.totalTimeString({1000: 1000}));
      });
    });
    describe("D) Booleans", () => {
      it ("true returns null", () => {
        assert.equal(TimeStrings.totalTimeString(true), null);
      });
      it ("false returns null", () => {
        assert.equal(TimeStrings.totalTimeString(false), null);
      });
    })
  });

  describe ("2) Numeric params", () => {
    describe("A) Negative numbers", () => {
      it ("-1 ms returns null", () => {
        assert.equal(TimeStrings.totalTimeString(-1), null);
      });
    });
    describe("B) Decimal/Floating Point numbers", () => {
      it ("0.00 returns '0 seconds'", () => {
        assert.equal(TimeStrings.totalTimeString(0.00), "0 seconds");
      });
      it ("0.50 returns '0 seconds'", () => {
        assert.equal(TimeStrings.totalTimeString(0.50), "0 seconds");
      });
      it ("0.99 returns '0 seconds'", () => {
        assert.equal(TimeStrings.totalTimeString(0.99), "0 seconds");
      });
    })
    describe("C) Seconds", () => {
      it ("Zero ms returns '0 seconds'", () => {
        assert.equal(TimeStrings.totalTimeString(0), "0 seconds");
      });
      it ("999 ms returns '0 seconds'", () => {
        assert.equal(TimeStrings.totalTimeString(999), "0 seconds");
      });
      it ("1000 ms returns '1 second'", () => {
        assert.equal(TimeStrings.totalTimeString(1000), "1 second");
      });
    });
    describe("D) Minutes", () => {
      it ("60000 ms returns '1 minute, 0 seconds'", () => {
        assert.equal(TimeStrings.totalTimeString(60000), "1 minute, 0 seconds");
      });
      it ("61000 ms returns '1 minute, 1 second'", () => {
        assert.equal(TimeStrings.totalTimeString(61000), "1 minute, 1 second");
      });
      it ("3599000 ms returns '59 minutes, 59 seconds'", () => {
        assert.equal(TimeStrings.totalTimeString(3599000), "59 minutes, 59 seconds");
      })
    });
    describe("E) Hours", () => {
      it ("3600000 ms returns '1 hour'", () => {
        assert.equal(TimeStrings.totalTimeString(3600000), "1 hour");
      });
    });
    describe ("F) Days", () => {
      it ("86400000 ms returns '1 day'", () => {
        assert.equal(TimeStrings.totalTimeString(86400000), "1 day");
      });
    });
    describe ("G) Weeks", () => {
      it ("604800000 ms returns '1 week'", () => {
        assert.equal(TimeStrings.totalTimeString(604800000), "1 week");
      });
    });
    describe ("H) Other values", () => {
      it ("2592000000 ms returns '4 weeks, 2 days' (30 days)", () => {
        assert.equal(TimeStrings.totalTimeString(2592000000), "4 weeks, 2 days");
      });
      it ("31536000000 ms returns 52 weeks, 1 day (365 days)", () => {
        assert.equal(TimeStrings.totalTimeString(31536000000), "52 weeks, 1 day");
      });
    });
  });
});
