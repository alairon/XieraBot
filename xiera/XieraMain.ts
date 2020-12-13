require('dotenv').config();
import fs = require('fs');
import path = require('path');
import Discord = require('discord.js');

import TokenManager = require('./components/Core/Token/TokenManager');
import Events = require('./components/Event/Events');

interface XieraConfig {
  xiera: {
    token: string,
    flags: string 
  },
  data: {
    url: string,
    refreshInterval: number
  }
}

interface XieraString {
  client: {
    login: {
      error: string
    },
    on: {
      ready: string,
      rateLimit: string,
      warn: string,
      error: string,
      shardError: string,
      shardReconnecting: string,
      shardResume: string,
      unhandledRejection: string
    },
    message: {
      default: string
    }
  }
}

// Reads Xiera's configuration values
function readConfig(path: string): XieraConfig {
  return (<XieraConfig>JSON.parse(fs.readFileSync(path, 'utf8')));
}

// Reads Xiera's strings
function readStrings(path: string): XieraString {
  return (<XieraString>JSON.parse(fs.readFileSync(path, 'utf8')));
}

// Read and set the configuration file
let config: XieraConfig = readConfig(path.join(__dirname, 'xiera.json'));
// Read from the strings file
let XieraStrings: XieraString = readStrings(path.join(__dirname, 'XieraStrings.json'));

// Initialize the Discord Client
const Client = new Discord.Client();
const Token = new TokenManager.TokenManager(config.xiera.token, config.xiera.flags);
const Event = new Events.Events();

/**
 * STARTUP FUNCTIONS
 * Functions placed in this async function will execute in the background prior to starting the bot
 */
;(async () => {
  await Event.initEvents(config.data.url, config.data.refreshInterval);
})();

/**
 * DISCORD CLIENT FUNCTIONS
 */
// Log into Discord using the Discord client key
Client.login(process.env.CLIENTKEY).catch((err) => { console.error(XieraStrings.client.login.error + `\n${err}`) });

// When Xiera is finished loading
Client.once('ready', () => {
  console.log(XieraStrings.client.on.ready);
});

// Being rate limited
Client.on('rateLimit', (rateData) => {
  console.log(XieraStrings.client.on.rateLimit + `\n${rateData}`);
});

// Upon receiving a warning
Client.on('warn', (msg) => {
  console.log(XieraStrings.client.on.warn + `\n${msg}`);
});

// Upon receiving an error
Client.on('error', (err) => {
  console.error(XieraStrings.client.on.error + `\n${err}`);
});

// Log any websocket errors
Client.on('shardError', (err) => {
  console.error(XieraStrings.client.on.shardError + `\n${err}`);
});

// Xiera attempting to reconnect to Discord
Client.on('shardReconnecting', () => {
  console.log(XieraStrings.client.on.shardReconnecting);
});

// When reconnected to Discord
Client.on('shardResume', () => {
  console.log(XieraStrings.client.on.shardResume);
});

// Catch unhandled rejections from async functions
Client.on('unhandledRejection', (err) => {
  console.error(XieraStrings.client.on.unhandledRejection + `\n${err}`);
});

// Xiera's bahaviour upon receiving a message
Client.on('message', async (message) => {
  // Stop Xiera from responding to herself (or any other bots)
  if (message.author.bot) return;

  //Check origin of the message
  let content = message.content;
  switch(message.channel.type){
    // Direct Message
    case 'dm':
      // Checks for the flag, removes if present
      if (Token.tokenExists(message.content)){
        content = Token.removeToken(message.content);
      }
      // Perform the command outside the if bracket
      console.log(content);
      break;
    // Text channel
    case 'text':
      // Checks for the flag, stops if missing
      if (Token.tokenExists(message.content)){
        content = Token.removeToken(content);
        // Determine what info the user wants Xiera to provide them
        const desiredAction = Token.getUserAction(content);

        if (desiredAction){
          console.log(`User action: '${desiredAction[0]}'`);
          console.log(`User parameters: '${desiredAction[1]}'`);
        }
        else {
          console.log('INSTRUCTIONS');
        }
      }

      break;
    // Any other channel (News and others)
    case 'news':
      // Do nothing
      break;
    default:
      console.log(XieraStrings.client.message.default);
  }
});
