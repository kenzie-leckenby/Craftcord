const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const DataImageAttachment = require("dataimageattachment");
const iconCompiler = require('.././embedBuilders/achievementIconCompiler.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('All tests for the craftcord bot')
    .addSubcommand(subcommand =>
        subcommand
            .setName('achievement_icon_compiler_tests')
            .setDescription('Run tests on both the gif and png icon compilers')),
    async execute(interaction) {
        const achievementIconGifTest = await iconCompiler.testOverlay('https://minecraft.wiki/images/Advancement-plain-raw.png', 'https://minecraft.wiki/images/Invicon_Enchanted_Book.gif');
            const achievementIconPngTest = await iconCompiler.testOverlay('https://minecraft.wiki/images/Advancement-plain-raw.png','https://minecraft.wiki/images/Invicon_Diamond_Chestplate.png');

            const gifTestEmbed = new EmbedBuilder()
                .setColor('Yellow')
                .setTitle('Achievement Gif Overlay Test')
                .setThumbnail('attachment://achievementoverlay.gif') // Gif

            const pngTestEmbed = new EmbedBuilder()
                .setColor('Yellow')
                .setTitle('Achievement Png Overlay Test')
                .setThumbnail('attachment://achievementoverlay.png')

            await interaction.reply ({
                embeds:
                    [gifTestEmbed,
                    pngTestEmbed],
                files:
                    [new DataImageAttachment(achievementIconGifTest, {name:"achievementoverlay.gif"}),
                    new DataImageAttachment(achievementIconPngTest, {name:"achievementoverlay.png"})],
                ephemeral:
                    true
                });
    },
};