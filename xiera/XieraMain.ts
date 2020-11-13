require('dotenv').config();
import fs = require('fs');
import path = require('path');
import Discord = require('discord.js');

import TokenManager = require('./components/Core/Token/TokenManager');
import Events = require('./components/Event/Events');
import { exit } from 'process';

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

// Reads Xiera's configuration values
function readConfig(path: string): XieraConfig {
  return (<XieraConfig>JSON.parse(fs.readFileSync(path, 'utf8')));
}

// Read and set the configuration file
let config: XieraConfig = readConfig(path.join(__dirname, 'xiera.json'));

// Initialize the Discord Client
const client = new Discord.Client();
const token = new TokenManager.TokenManager(config.xiera.token, config.xiera.flags);
const event = new Events.Events();

// All functions that appear in this block will execute upon startup
;(async () => {
  await event.initQuestEvents(config.calendar.quest.url);
  event.getQuests();
})();

/**
 * CLIENT FUNCTIONS
 */
// Log into Discord using the Discord client key
client.login(process.env.CLIENTKEY).catch((err) => { console.log(`Xiera could not connect to Discord.\n${err}`); exit(1)});

// When Xiera is finished loading
client.once('ready', () => {
  console.log('Hi-CAST Xiera, up and ready!');
});

// Being rate limited
client.on('rateLimit', (rateData) => {
  console.log(`There's a little too many requests going on right now. Please hold.\n${rateData}`);
});

// Upon receiving a warning
client.on('warn', (msg) => {
  console.log(`Xiao's warning me about something:\n${msg}`);
});

// Upon receiving an error
client.on('error', (err) => {
  console.error(`I've encountered an error?!\n${err}`);
});

// Log any websocket errors
client.on('shardError', (err) => {
  console.error(`Websocket error: ${err}`);
});

// Catch unhandled rejections from async functions
client.on('unhandledRejection', (err) => {
  console.error(`There was an unhandled promise rejection.\n${err}`);
});

// Xiera's bahaviour upon receiving a message
client.on('message', async message => {
  // Stop Xiera from responding to herself (or any other bots)
  if (message.author.bot) return;

  //Check origin of the message
  switch(message.channel.type){
    // Direct Message
    case 'dm':
      // Checks for the flag, removes if present
      console.log(token.removeToken(message.content));
      break;
    // Text channel
    case 'text':
      // Checks for the flag, stops if missing
      if (token.tokenExists(message.content)){
        const content = token.removeToken(message.content);
        console.log(content);
      }
      
      break;
    // Any other channel (News and others)
    case 'news':
      break;
    default:
      console.log('That shouldn\'t have happened. I thought I covered everything.');
  }  
});
