const { Client, IntentsBitField } = require('discord.js');
const { token, filePath, rconPort, rconPassword, channelID } = require('../config.json')
const Rcon = require('rcon');
const fs = require('fs');
let lastMsgID = -1;

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
})

// Connects the RCON with minecraft server hosted on local machine
var conn = new Rcon('localhost', rconPort, rconPassword);

conn.on('auth', function() {
  console.log("Authenticated");
}).on('response', function(str) {
}).on('error', function(err) {
  console.log("Error: " + err);
}).on('end', function() {
  console.log("Connection closed");
  process.exit();
});

conn.connect();

// Converts messages into the tellraw syntax minecraft uses
function tellrawFormatter(messageBody, username = undefined) {
  if (username === undefined) {
    return `/tellraw @a ["", {"text":"[Discord]", "color":"blue"}, " ${messageBody}"]`
  }
  else {
    return `/tellraw @a ["", {"text":"[Discord]", "color":"blue"}, " ${username}:" ," ${messageBody}"]`
  }
}

// Print on start
client.on('ready', (c) => {
  console.log(`${c.user.username} is ready`);
  const fileWatcher = fs.watch(`${filePath}src/latest_message.json`, event => {
    if (event === 'change') {
      fs.readFile(`${filePath}src/latest_message.json`, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading JSON file:', err);
        } else {
          try {
            const channel = client.channels.cache.get(channelID);
            const jsonData = JSON.parse(data);
            if ((jsonData.message === 'left' || jsonData.message === 'joined') && jsonData.id != lastMsgID) {
              jsonData.message === 'left' && channel.send(`${jsonData.username} left the game`)
              jsonData.message === 'joined' && channel.send(`${jsonData.username} joined the game`)
              lastMsgID = jsonData.id;
            } else {
              jsonData.id != lastMsgID && channel.send(`${jsonData.username}: ${jsonData.message}`);
              lastMsgID = jsonData.id;
            }
          } catch (error) {
            console.error('Error parsing JSON data:', error);
          }
        }
      });
    }
  });

  fileWatcher.on('error', (err) => {
    console.error('File watcher error:', err);
  });
});

// When a user sends a message in chat
client.on('messageCreate', (msg) => {
  if (msg.channel.id === channelID) {
    msg.author.bot == false && conn.send(tellrawFormatter(msg.content, msg.author.displayName));
  }
});

client.login(token);

