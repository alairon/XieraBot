require('dotenv').config();
import config = require('./config.json');
import UQManager = require('./plugins/UQManager/UQManager');

import Discord = require('discord.js');
const client = new Discord.Client();
const token = new RegExp (config.xiera.token, config.xiera.flags);

// Startup. Run all startup functions once the Discord client is ready
client.once('ready', () => {
  
  /* --- All startup scripts loaded and complete ---*/
  console.log('Hi-CAST Xiera, up and ready!');
})

// Upon receiving a message from a channel she's in or a DM
client.on('message', message => {
  let now = new Date();

  // Create a timestamp in the format: YYYY/MM/DD HH:MM:SS
  let time: string = `${now.getUTCFullYear()}/${now.getUTCMonth()}/${now.getUTCDate()} ${now.getUTCHours()}:${now.getUTCMinutes()}:${now.getUTCSeconds()} UTC`;

  // Stop Xiera from trying to talk to herself (or any other bots)
  if (message.author.bot) return;

  /* Xiera Responses */
  // Direct Messages
  if (message.channel.type === 'dm') {
    // TODO: DMs should not require the bot flag to initiate.
    if (token.test(message.content)) {
      message.channel.send(`Hi ${message.author.username}, just letting you know that you won't need to flag me down when we're talking through a DM :happy:`);
      console.log('Remove !xiera, then read command');
    }
    else {
      console.log('Read command without !xiera');
    }
    
    console.log (`${message.author.username} via DM [${time}]: ${message}`);
  }
  // Text channels in a guild (server)
  else if (message.channel.type === 'text' && token.test(message.content)) {
    console.log (`${message.author.username} via ${message.guild.name} [${time}]: ${message}`);
  }
  // Everything else
  else {
    console.log ('Message ignored.');
  }

  if (token.test(message.content)) {
    message.channel.send('Hello!');
  }
})

//Logs into the client using the Discord Client Key
client.login(process.env.CLIENTKEY);