const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const mcQuery = require('../queryAndRCON/mcServerQuery.js')

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
            const playerInfo = await mcQuery.checkPlayerInfo();

            const playersEmbed = new EmbedBuilder()
                .setColor('Blue')
                .addFields(
                    { name: 'Player Count', value: `${playerInfo.numPlayersOn}/${playerInfo.maxPlayers}`},
                    { name: 'Players', value: `\`\`\`${playerInfo.playersOnList.join('\`\`\` \`\`\`')}\`\`\``}
                )
            await interaction.reply({embeds: [playersEmbed], ephemeral: true });
        } else if (interaction.options.getSubcommand() === 'info') {
            const status = await mcQuery.checkServerStatus();

            const statusEmbed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle(status.motd)
                .setDescription(`Server Version: ${status.currentVersion}`)
            await interaction.reply({embeds: [statusEmbed], ephemeral: true });
        }
    },
};