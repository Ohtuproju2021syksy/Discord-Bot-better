const { updateGuide, createCategoryName, findChannelWithNameAndType, msToMinutesAndSeconds, handleCooldown } = require("../../services/service");
const { sendEphemeral } = require("../utils");
const Discord = require('discord.js');

const used = new Map();

const execute = async (interaction, client, Groups) => {
    // const courseName = interaction.data.options[0].value.toLowerCase().trim();
    // const guild = client.guild;
    // return sendEphemeral(client, interaction, `Invalid course name: ${courseName} or the course is private already.`);

    const channel = client.channels.cache.find(c => c.name === "general" && c.type === "text");

    const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Some title')

    channel.send(exampleEmbed);
};

module.exports = {
    name: "poll",
    description: "Create a poll",
    usage: "[course name]",
    args: false,
    joinArgs: true,
    guide: true,
    role: "teacher",
    options: [
        {
            name: "course",
            description: "Hide given course",
            type: 3,
            required: false,
        },
    ],
    execute,
};
