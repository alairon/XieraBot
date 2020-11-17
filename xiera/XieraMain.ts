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
  calendar: {
    quest: {
      refreshInterval: number,
      url: string
    },
    casino: {
      refreshInterval: number,
      url: string
    }
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
let XieraStrings: XieraString = readStrings(path.join(__dirname, 'XieraStrings.json'));

// Initialize the Discord Client
const client = new Discord.Client();
const token = new TokenManager.TokenManager(config.xiera.token, config.xiera.flags);
const event = new Events.Events();

/**
 * STARTUP FUNCTIONS
 * Functions placed in this async function will execute in the background
 */
;(async () => {
  await event.initQuestEvents(config.calendar.quest.url, config.calendar.quest.refreshInterval);
  await event.initCasinoEvents(config.calendar.casino.url, config.calendar.casino.refreshInterval);
})();

/**
 * CLIENT FUNCTIONS
 */
// Log into Discord using the Discord client key
client.login(process.env.CLIENTKEY).catch((err) => { console.error(XieraStrings.client.login.error + `\n${err}`) });

// When Xiera is finished loading
client.once('ready', () => {
  console.log(XieraStrings.client.on.ready);
});

// Being rate limited
client.on('rateLimit', (rateData) => {
  console.log(XieraStrings.client.on.rateLimit + `\n${rateData}`);
});

// Upon receiving a warning
client.on('warn', (msg) => {
  console.log(XieraStrings.client.on.warn + `\n${msg}`);
});

// Upon receiving an error
client.on('error', (err) => {
  console.error(XieraStrings.client.on.error + `\n${err}`);
});

// Log any websocket errors
client.on('shardError', (err) => {
  console.error(XieraStrings.client.on.shardError + `\n${err}`);
});

// Xiera attempting to reconnect to Discord
client.on('shardReconnecting', () => {
  console.log(XieraStrings.client.on.shardReconnecting);
});

// When reconnected to Discord
client.on('shardResume', () => {
  console.log(XieraStrings.client.on.shardResume);
});

// Catch unhandled rejections from async functions
client.on('unhandledRejection', (err) => {
  console.error(XieraStrings.client.on.unhandledRejection + `\n${err}`);
});

// Xiera's bahaviour upon receiving a message
client.on('message', async message => {
  // Stop Xiera from responding to herself (or any other bots)
  if (message.author.bot) return;

  //Check origin of the message
  let content = message.content;
  switch(message.channel.type){
    // Direct Message
    case 'dm':
      // Checks for the flag, removes if present
      if (token.tokenExists(message.content)){
        content = token.removeToken(message.content);
      }
      console.log(content);
      break;
    // Text channel
    case 'text':
      // Checks for the flag, stops if missing
      if (token.tokenExists(message.content)){
        content = token.removeToken(content);
      }
      console.log(content);
      break;
    // Any other channel (News and others)
    case 'news':
      break;
    default:
      console.log(XieraStrings.client.message.default);
  }  
});
