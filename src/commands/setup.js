const { SlashCommandBuilder, ChannelType } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setChannel')
        .setDescription('Change what channel the bot will listen for responses and send messages in')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel you want the bot in')
                .addChannelTypes(ChannelType.GuildText))
}