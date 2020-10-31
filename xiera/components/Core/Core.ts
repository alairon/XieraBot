/* As these functions do not mutate, we can call them as if they were static functions */

import c_TokenManager = require('./Token/TokenManager');
import c_UTCStrings = require('./Date/UTCStrings');
import c_TimeStrings = require('./Date/TimeStrings');

// Core.TokenManager
const TokenManager = c_TokenManager.TokenManager;
export { TokenManager };

// Core.TimeStrings
const TimeStrings = c_TimeStrings.TimeStrings;
export { TimeStrings };

// Core.UTCStrings
const UTCStrings = c_UTCStrings.UTCStrings;
export { UTCStrings };
