const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const {
    MessageEmbed,
    MessageAttachment
} = require('discord.js');
const {
    color
} = require('../config.json');
const canvacord = require("canvacord");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('distracted')
        .addUserOption(option => option.setName('user').setRequired(true).setDescription("Erwähne hier eine Person"))
        .addUserOption(option => option.setName('user2').setRequired(true).setDescription("Erwähne hier noch eine Person"))
        .addUserOption(option => option.setName('user3').setRequired(false).setDescription("Erwähne hier noch eine dritte Person"))
        .setDescription('Oh, wer bist du denn?'),
    async execute(interaction) {
        if (interaction.member.nickname != null) {
            nick = interaction.member.nickname;
        } else {
            nick = interaction.user.username;
        }
        userpp = interaction.user.avatarURL();
        mentionedUser = interaction.options.get('user').user.avatarURL({ dynamic: false, format: 'png' });
        mentionedUser2 = interaction.options.get('user2').user.avatarURL({ dynamic: false, format: 'png' });
        try {
            mentionedUser3 = interaction.options.get('user3').user.avatarURL({ dynamic: false, format: 'png' });
            image = await canvacord.Canvacord.distracted(mentionedUser.toString(), mentionedUser2.toString(), mentionedUser3.toString());
        } catch(e) {
            image = await canvacord.Canvacord.distracted(mentionedUser.toString(), mentionedUser2.toString());
        }
        let attachment = await new MessageAttachment(image, "distracted.png");
        const embeddistracted = new MessageEmbed()
            .setColor(`${color}`)
            .setImage('attachment://distracted.png')
            .setFooter(`Ausgeführt von:  ${nick}`, `${userpp}`);
        await interaction.reply({
            embeds: [embeddistracted],
            files: [attachment]
        });
    },
};