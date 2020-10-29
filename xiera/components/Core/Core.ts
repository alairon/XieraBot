import c_TokenManager = require('./Token/TokenManager');
import c_UTCStrings = require('./Date/UTCStrings');
import c_TimeStrings = require('./Date/TimeStrings');

const TokenManager = new c_TokenManager.TokenManager();
export { TokenManager };

const TimeStrings = new c_TimeStrings.TimeStrings();
export { TimeStrings };

const UTCStrings = new c_UTCStrings.UTCDate();
export { UTCStrings };