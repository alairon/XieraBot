require('dotenv').config();
import config = require('./config.json');
import Quests = require('./plugins/UQManager/quests');
import Casino = require('./plugins/UQManager/casino');
import Fuse = require('fuse.js');

import Discord = require('discord.js');
const client = new Discord.Client();
const token = new RegExp (config.xiera.token, config.xiera.flags);

let quests = new Quests.Events();
quests.initEvents();
quests.setEvents();

let casino = new Casino.Events();
casino.initEvents();
casino.setEvents();

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
  // Direct Messages
  switch(message.channel.type){
    case 'dm': 
      // Direct Message to the bot
      console.log (`${message.author.username} via DM [${time}]: ${message}`);
      if (token.test(message.content)) {
        message.channel.send(`Hi ${message.author.username}, just letting you know that you won't need to flag me down when we're talking through a DM :smile:`);
        console.log('Remove !xiera, then read command');
      }
      else if (/!test/mi.test(message.content)){
        message.channel.send('Someone requested I run a quick test. Please check the visiphone terminal for details.');
        quests.displayEvents();
        casino.displayEvents();
      }
      else if (/uq/mi.test(message.content)){
        let events = quests.events;
        console.log(events);
      }
      else if (/casino/mi.test(message.content)){
        let events = casino.events;
        console.log(events);
      }
      else {
        console.log('Read command without !xiera');
      }
      break;
    case 'text':
      // Message on a server channel
      if (token.test(message.content)){
        const command = message.content.split(' ');
        console.log (`${message.author.username} via ${message.guild.name} [${time}]: ${command}`);
        switch (command[1]) {
          case 'uq':
            if (command[2]){
              message.channel.send(`${command[2]}?`);
            } 
            console.log(quests.getEvents());
            break;
          case 'casino':
            if (command[2]){
              message.channel.send(`${command[2]}?`);
            }
            console.log(casino.getEvents());
            break;
          case 'info':
            const details = command[2];

            if (details){
              let userMsg = await message.channel.send(`You're looking for '${details}'? Sure thing! I'll just look it up for you, won't take long.`);
              console.log(details);
              userMsg.edit('Done!');
            }
            else {
              message.channel.send(`I can't seem to find anything about this in the database. I'll ask Casra if he knows anything about it.`);
            }
            break;
          default: 
            message.channel.send(`Hello ${message.author.username}!\nI can currently tell you what events are happening around ARKS based on what Casara sent me.\nJust let me know if you want info about urgent quests (\`uq\`), or what's going on at the casino (\`casino\`).`);
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
