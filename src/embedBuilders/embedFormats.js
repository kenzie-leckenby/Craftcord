const { EmbedBuilder } = require('discord.js');
const { achievements, backgrounds} = require ('./achievementIconURLs.json')
const iconCompiler = require('./achievementIconCompiler');
const DataImageAttachment = require("dataimageattachment");



// Creates an Embed for Minecraft Events such as a death, join, or leave message
// Returns an object that can be directly passed to the channel.send() function
function event(message) {
    // Chooses a border color based on t
    const borderColor = message.type === 'playerLeave' || message.type === 'death' ? 'Red' : 'Green';

    const newEmbed = new EmbedBuilder()
        .setColor(borderColor)
        .setAuthor({ name: `${message.username} ${message.body}` });

    return {
        embeds: [newEmbed],
    };
}

// Creates an Embed for Minecraft Achievement Message from the initial object returned by logReader.js
// Returns an object that can be directly passed to the channel.send() function
function achievement(message) {
    return new Promise(async (resolve) => {
      const foundAchievement = achievements.find(achievement => achievement.name === message.body.substring(message.body.indexOf('[') + 1, message.body.indexOf(']')));
      const backgroundImg = backgrounds.find(background => background.name === message.type).iconURL;
      const achievementImg = foundAchievement.iconURL;

      const imageDataUri = await iconCompiler.overlayImagesFromURL(backgroundImg, achievementImg);

      const borderColor = message.type === 'advancement' || message.type === 'goal' ? 'Green' : 'DarkPurple';

      let newEmbed;
      if (achievementImg.substring(achievementImg.length - 3) == 'png') {
        newEmbed = new EmbedBuilder()
          .setColor(borderColor)
          .setTitle(foundAchievement.name)
          .setAuthor({ name: `${message.username} ${message.body.substring(0, message.body.indexOf('[') - 1)}` })
          .setDescription(foundAchievement.description)
          .setThumbnail('attachment://achievement.png');
        resolve({
          embeds: [newEmbed],
          files: [new DataImageAttachment(imageDataUri, {name:"achievement.png"})]
        });
      }
      newEmbed = new EmbedBuilder()
        .setColor(borderColor)
        .setTitle(foundAchievement.name)
        .setAuthor({ name: `${message.username} ${message.body.substring(0, message.body.indexOf('[') - 1)}` })
        .setDescription(foundAchievement.description)
        .setThumbnail('attachment://achievement.gif');
      resolve({
        embeds: [newEmbed],
        files: [new DataImageAttachment(imageDataUri, {name:"achievement.gif"})]
      });
    });
}

module.exports = {
    event,
    achievement,
}