require('dotenv').config();
import fs = require('fs');
import path = require('path');
import Quests = require('./plugins/EventManager/quests');
import Casino = require('./plugins/EventManager/casino');

import Discord = require('discord.js');
const client = new Discord.Client();

// Configure and initialize
const config: XieraConfig = readConfig(path.join(__dirname,'xiera.json'));
const token = new RegExp (config.xiera.token, config.xiera.flags);
const quests = new Quests.Events(config.calendar.quest.url, config.calendar.quest.refreshInterval);
const casino = new Casino.Events(config.calendar.casino.url, config.calendar.casino.refreshInterval);

// Startup. Run all startup functions once the Discord client is ready
client.once('ready', () => {
  /* --- All startup scripts loaded and complete ---*/
  console.log('Hi-CAST Xiera, up and ready!');
})

// Upon receiving a message from a channel she's in or a DM
client.on('message', async message => {
  let now = new Date();

  // Create a timestamp in the format: YYYY/MM/DD HH:MM:SS
  let time: string = `${now.getUTCFullYear()}/${now.getUTCMonth()}/${now.getUTCDate()} ${now.getUTCHours()}:${now.getUTCMinutes()}:${now.getUTCSeconds()} UTC`;

  // Stop Xiera from trying to talk to herself (or any other bots)
  if (message.author.bot) return;

  /* Xiera Responses */
  switch(message.channel.type){
    case 'dm': 
      // Direct Message to the bot
      console.log (`${message.author.username} via DM [${time}]: ${message}`);
      let content: string = message.content;

      if (token.test(message.content) && message.mentions.has(client.user)){
        message.channel.send(`<@${message.author.id}>, I can't believe someone would try to flag *and* mention me at the same time! Arrghh!\nSorry for that outburst. Anyways, you don't need to use the flag *or* mention me while we're using DMs.`);
        break;
      } else if (message.mentions.has(client.user)){
        message.channel.send(`Hey! You don't need to mention me when we're talking through a DM!`);
        //Attempt to remove the mention
        try {
          content = message.content.match(/(?<=>\s?).*/mi)[0];
        }
        catch(err){
        }
      } else if (token.test(message.content)) {
        message.channel.send(`Hello! Friendly Xiera here letting you know that you won't need to use the flag when we're talking through a DM.`);
        //Attempt to remove the flag
        try{
          content = message.content.match(/(?<=x!\s?).*/mi)[0];
        }
        catch(err){
        }
      }

      //Divide the string into tags
      let command: Array<string>;
      
      if (content){
        command = content.split(' ');
      }
      else{
        command = [];
      }

      switch (command[0]) {
        case 'uq':
        case 'q':
        case 'quests':
        case 'events':
          const uqRes = await quests.findEvent(content);
          message.channel.send(uqRes);
          break;
        case 'casino':
        case 'c':
          const casinoRes = await casino.displayEvents();
          message.channel.send(casinoRes);
          break;
        case 'info':
        case 'i':
          message.channel.send(`This function isn't quite ready yet, so I don't really have anything to share right now.`);
          break;
        default: 
          message.channel.send(`Hello ${message.author.username}!\nI can currently tell you what scheduled events are happening on the Oracle Fleet!\nJust let me know if you want info about upcoming urgent quests (\`uq\`), or what boosts are available at the casino (\`casino\`).`);
      }
    case 'text':
      // Message on a server's text channel
      if (token.test(message.content) || message.mentions.has(client.user)){
        let content: string;
        //Attempt to remove any mentions if it was a mention
        if (message.mentions.has(client.user)){
          //Attempt to remove any mentions
          try {
            content = message.content.match(/(?<=>\s?).*/mi)[0];
          }
          catch(err){
          }
        }
        //Attempt to remove the flag
        try{
          content = message.content.match(/[^(^x!\s?)].*/mi)[0];
        }
        catch(err){
        }

        //Divide the string into tags
        let command: Array<string>;
        
        if (content){
          command = content.split(' ');
        }
        else{
          command = [];
        }

        console.log (`${message.author.username} via ${message.guild.name} [${time}]: ${command}`);
        switch (command[0]) {
          case 'uq':
          case 'u':
          case 'events':
            const uqRes = await quests.findEvent(content);
            message.channel.send(uqRes);
            break;
          case 'casino':
          case 'c':
            const casinoRes = await casino.displayEvents();
            message.channel.send(casinoRes);
            break;
          case 'info':
          case 'i':
            break;
          default: 
          message.channel.send(`Hello ${message.author.username}!\nI can currently tell you what scheduled events are happening on the Oracle Fleet!\nJust let me know if you want info about upcoming urgent quests (\`uq\`), or what boosts are available at the casino (\`casino\`).`);
        }
      }
      break;
    default:
      // do nothing
      console.log('Message ignored');
  }
})

//Logs into the client using the Discord Client Key
client.login(process.env.CLIENTKEY);

function readConfig(configDir: string): XieraConfig{
  const config = fs.readFileSync(configDir, 'utf8');
  return JSON.parse(config);
}

interface XieraConfig {
  "xiera": {
    token: string,
    flags: string 
  },
  "calendar": {
    "quest": {
      refreshInterval: number,
      url: string
    },
    "casino": {
      refreshInterval: number,
      url: string
    }
  }
}
