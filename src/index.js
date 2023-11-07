const { Client, GatewayIntentBits, EmbedBuilder, Collection, Events} = require('discord.js');
const { token, rconPort, rconPassword, channelID } = require('../config.json');
const { mcRCON } = require('./queryAndRCON/mcRCON.js');
const { LogReader } = require('./logFileParsing/logReader.js');
const path = require('path');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandsFile = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandsFile) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

const mcChat = new mcRCON(undefined, rconPort, rconPassword);

// Print on start
client.on(Events.ClientReady, () => {
  const logReader = new LogReader();
  logReader.on('latestMessageChanged', (output) => {
    const channel = client.channels.cache.get(channelID);
    function messageEmbed(borderColor) {
      return new EmbedBuilder()
        .setColor(borderColor)
        .setAuthor({ name: `${output.username} ${output.message}` })
    }
    if (output.type === 'chat') {
      channel.send(`${output.username}: ${output.message}`)
    }
    else if (output.type === 'playerJoin') {
      channel.send({ embeds: [messageEmbed('Green')]})
    }
    else if (output.type === 'playerLeave') {
      channel.send({ embeds: [messageEmbed('Red')]})
    }
    else if (output.type === 'death') {
      channel.send({ embeds: [messageEmbed('Red')]})
    }
    else if (output.type === 'advancement') {
      channel.send({ embeds: [messageEmbed('Green')]})
    }
    else if (output.type === 'goal') {
      channel.send({ embeds: [messageEmbed('Green')]})
    }
    else if (output.type === 'challenge') {
      channel.send({ embeds: [messageEmbed('DarkPurple')]})
    }
  })
});

// When a user sends a message in chat
client.on(Events.MessageCreate, (msg) => {
  if (msg.channel.id === channelID) {
    msg.author.bot == false && mcChat.sendMessage(msg.content, msg.author.displayName);
  }
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.login(token);

