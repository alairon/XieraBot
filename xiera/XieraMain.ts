require('dotenv').config();
import fs = require('fs');
import path = require('path');
import Discord = require('discord.js');

import TokenManager = require('./components/Core/Token/TokenManager');
import Events = require('./components/Event/Events');
//import News = require('./components/News/News');
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

function generateHelpMessage(name: string): Discord.MessageEmbed{
  const embed = new Discord.MessageEmbed;
  const HelpMessages = XieraStrings.client.message.usage;

  embed.setTitle('Xiera\'s Helpful Help Message');
  embed.setColor('#da79b1');
  embed.setDescription(HelpMessages.greetingA + name + HelpMessages.greetingB);
  embed.addFields(
    {
      name: 'Usage',
      value: HelpMessages.instructions
    },
    {
      name: '\u200B',
      value: '__**Available Commands**__'
    },
    {
      name: 'Urgent Quests',
      value: HelpMessages.instructionsUQ
    },
    {
      name: 'Urgent Quests (with a search term)',
      value: HelpMessages.instructionsUQSearch
    },
    {
      name: 'Casino',
      value: HelpMessages.instructionsCasino
    },
    {
      name: 'Reset',
      value: HelpMessages.instructionsReset
    },
    {
      name: 'Daily Crafting',
      value: HelpMessages.instructionsDC
    }
  );

  return(embed);
}

function generateHelpMessageDM(name: string){
  const embed = new Discord.MessageEmbed;
  const HelpMessages = XieraStrings.client.message.usage;

  embed.setTitle('Xiera\'s Helpful Help Message');
  embed.setColor('#da79b1');
  embed.setDescription(HelpMessages.greetingA + name + HelpMessages.greetingB);
  embed.addFields(
    {
      name: 'Usage',
      value: HelpMessages.instructionsDM
    },
    {
      name: '\u200B',
      value: '__**Available Commands**__'
    },
    {
      name: 'Urgent Quests',
      value: HelpMessages.instructionsUQ
    },
    {
      name: 'Urgent Quests (with a search term)',
      value: HelpMessages.instructionsUQSearch
    },
    {
      name: 'Casino',
      value: HelpMessages.instructionsCasino
    },
    {
      name: 'Reset',
      value: HelpMessages.instructionsReset
    },
    {
      name: 'Daily Crafting',
      value: HelpMessages.instructionsDC
    }
  );

  return(embed);
}

// Read and set the configuration file
let config: XieraConfig = readConfig(path.join(__dirname, 'xiera.json'));
// Read from the strings file
let XieraStrings: XieraString = readStrings(path.join(__dirname, 'XieraStrings.json'));

// Initialize the Discord Client
const client = new Discord.Client();
const Token = new TokenManager.TokenManager(config.xiera.token, config.xiera.flags);
const Event = new Events.Events();
//const NewsWebhook = new News.News(config.news);
const DailyCraft = new DailyCrafting();

/**
 * STARTUP FUNCTIONS
 * Functions placed in this async function will execute in the background prior to starting the bot
 */
;(async () => {
  await Event.initEvents(config.data.options, config.data.refreshInterval);
  //await NewsWebhook.initService();
})();

/**
 * DISCORD CLIENT FUNCTIONS
 */
// Log into Discord using the Discord client key
client.login(process.env.CLIENTKEY).catch((err) => { console.error(XieraStrings.client.login.error + `\n${err}`) });

// When Xiera is finished loading
client.once('ready', () => {
  console.log(XieraStrings.client.on.ready);
  client.user.setActivity('over the ARKS', {type: 'WATCHING'});
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
client.on('message', async (message) => {
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
      
      const res = await switchboard(desiredAction, message.author.username);
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
        console.log(`${message.member.displayName} via ${message.guild.name} ${time}`);

        const res = await switchboard(desiredAction, message.member.displayName);
        if (!res){
          message.channel.send(generateHelpMessage(message.member.displayName));
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

async function switchboard(desiredAction: Array<string>, name: string): Promise<string|Discord.MessageEmbed>{
  if (desiredAction){
    console.log(`> Action: '${desiredAction[0]}' | '${desiredAction[1]}'`);
    if (/^s?uq/mi.test(desiredAction[0])){
      if (desiredAction[1]){
        const results = await Event.searchEvents(desiredAction[1], true, name);
        return (results);
      }
      const results = await Event.searchUpcomingEventsEmbed(name);
      return (results);
    }
    /*
    else if (/^\s?uq2/mi.test(desiredAction[0])){
      if (desiredAction[1]){
        const results = await Event.searchEvents(desiredAction[1], false);
        return(results);
      }
      const results = await Event.searchUpcomingEvents();
      return(results);
    }*/
    else if (/^\s?casino/mi.test(desiredAction[0])){
      const results = await Event.searchUpcomingCasinoEventsEmbed(name);
      return (results);
    }
    /*
    else if (/^\s?casino/mi.test(desiredAction[0])){
      const results = await Event.searchUpcomingCasinoEvents();
      return(results);
    }
    else if (/^\s?reset2/mi.test(desiredAction[0])){
      const results = Reset.getResetTable();
      return (results);
    }*/
    else if (/^\s?reset/mi.test(desiredAction[0])){
      const results = Reset.getResetTableEmbed(name);
      return(results);
    }
    else if (/^\s?dc/mi.test(desiredAction[0])){
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
