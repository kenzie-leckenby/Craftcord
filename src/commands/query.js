const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Check how many and who are on currently or server status')
    .addSubcommand(subcommand =>
        subcommand
            .setName('players')
            .setDescription('Check how many and who are on currently'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('status')
            .setDescription('Check the server status')),
    async execute(interaction) {
        if (interaction.options.getSubCommand() === 'players') {
            // Query the server to find player info
        } else if (interaction.options.getSubCommand() === 'status') {
            // Query the server to check status
        }
    },
};