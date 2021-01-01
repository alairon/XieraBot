require('dotenv').config();
import fs = require('fs');
import path = require('path');
import Discord = require('discord.js');

import TokenManager = require('./components/Core/Token/TokenManager');
import Events = require('./components/Event/Events');
import { XieraConfig, XieraString } from './@types/XieraMain';
import { Reset } from './components/Reset/Reset';
import { DailyCrafting } from './components/DailyCrafting/DailyCrafting';
import { UTCStrings } from './components/Core/Date/UTCStrings';

// Reads Xiera's configuration values
function readConfig(path: string): XieraConfig {
  return (<XieraConfig>JSON.parse(fs.readFileSync(path, 'utf8')));
}

// Reads Xiera's strings
function readStrings(path: string): XieraString {
  return (<XieraString>JSON.parse(fs.readFileSync(path, 'utf8')));
}

function generateHelpMessage(name: string){
  const HelpMessages = XieraStrings.client.message.usage;
  return(
    HelpMessages.greetingA + name + HelpMessages.greetingB + HelpMessages.instructions + HelpMessages.instructionsUQ + HelpMessages.instructionsCasino + HelpMessages.instructionsReset
  );
}

function generateHelpMessageDM(name: string){
  const HelpMessages = XieraStrings.client.message.usage;
  return(
    HelpMessages.greetingA + name + HelpMessages.greetingB + HelpMessages.instructionsDM + HelpMessages.instructionsUQ + HelpMessages.instructionsCasino + HelpMessages.instructionsReset
  );
}

// Read and set the configuration file
let config: XieraConfig = readConfig(path.join(__dirname, 'xiera.json'));
// Read from the strings file
let XieraStrings: XieraString = readStrings(path.join(__dirname, 'XieraStrings.json'));

// Initialize the Discord Client
const Client = new Discord.Client();
const Token = new TokenManager.TokenManager(config.xiera.token, config.xiera.flags);
const Event = new Events.Events();
const DailyCraft = new DailyCrafting();
const HelpMessage = XieraStrings.client.message.usage;

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

  // Gerneate a timestampe
  const time: string = UTCStrings.getTimestamp(new Date());

  //Check origin of the message
  let content = message.content;
  switch(message.channel.type){
    // Direct Message
    case 'dm':
      // The flag is optional in a DM, but remove it if it's present.
      if (Token.tokenExists(message.content)){
        content = Token.removeToken(message.content);
      }

      // Determine what the user wants to do
      const desiredAction = Token.getUserAction(content);
      // Log when and where the message originated from
      console.log(`${message.author.username} via DM ${time}`);
      
      const res = await switchboard(desiredAction);
      if (!res){
        message.channel.send(generateHelpMessageDM(message.author.username));
      }
      else{
        message.channel.send(res);
      }

      break;
    // Text channel
    case 'text':
      // Checks for the flag, stops if missing
      if (Token.tokenExists(message.content)){
        content = Token.removeToken(content);
        // Determine what info the user wants Xiera to provide them
        const desiredAction = Token.getUserAction(content);
        // Log when and where the message originated from
        console.log(`${message.author.username} via ${message.guild.name} ${time}`);

        const res = await switchboard(desiredAction);
        if (!res){
          message.channel.send(generateHelpMessage(message.author.username));
        }
        else{
          message.channel.send(res);
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

async function switchboard(desiredAction: Array<string>): Promise<string>{
  if (desiredAction){
    console.log(`> Action: '${desiredAction[0]}' | '${desiredAction[1]}'`);
    if (/^\s?uq/.test(desiredAction[0])){
      if (desiredAction[1]){
        const results = await Event.searchEvents(desiredAction[1]);
        return(results);
      }
      else {
        const results = await Event.searchUpcomingEvents();
        return(results);
      }
    }
    else if (/^\s?casino/.test(desiredAction[0])){
      const results = await Event.searchUpcomingCasinoEvents();
      return(results);
    }
    else if (/^\s?reset/.test(desiredAction[0])){
      const results = Reset.getResetTable();
      return(results);
    }
    else if (/^\s?dc/.test(desiredAction[0])){
      const results = DailyCraft.getDailyCrafting();
      return(results);
    }
    else {
      return(null);
    }
  }
  console.log(`> Action: none`);
  return(null);
}