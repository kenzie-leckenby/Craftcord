const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const mcQuery = require('../queryAndRCON/mcServerQuery.js')
const DataImageAttachment = require("dataimageattachment");

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
            .setName('info')
            .setDescription('Check the server info')),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'players') {
            const status = await mcQuery.checkServerStatus();

            const playersEmbed = new EmbedBuilder()
                .setColor('Blue')
                .addFields(
                    { name: 'Player Count', value: `${status.online}/${status.maxPlayers}`},
                    { name: 'Players', value: status.playersOnList}
                )
            await interaction.reply({embeds: [playersEmbed], ephemeral: true });
        } else if (interaction.options.getSubcommand() === 'info') {
            const status = await mcQuery.checkServerStatus();

            const statusEmbed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle(`${status.motd} Status`)
                .setThumbnail('attachment://servericon.png')
                .addFields(
                    { name: 'Version', value: `${status.currentVersion}`, inline: true},
                    { name: 'Players', value: `${status.online}/${status.maxPlayers}`, inline: true}
                )
            await interaction.reply({embeds: [statusEmbed], files: [new DataImageAttachment(status.icon, {name:"servericon.png"})], ephemeral: true });
        }
    },
};