const { sendReplyMessage, sendSpamReport } = require("../services/message");

let messageCache = [];

const options = {
    interval: 2000, // In milliseconds
    messageThreshold: 5, // How many messages in the last <interval> milliseconds to trigger
};

const spamHandler = async (message, client) => {

    if (message.author.bot || message.member.permissions.has("ADMINISTRATOR")) return false; // Ignore bot and admin messages
    const relevantMessageData = {
        messageID: message.id,
        guildID: message.guild.id,
        authorID: message.author.id,
        channelID: message.channel.id,
        messageContent: message.content,
        timeStamp: message.createdTimestamp
    };
    messageCache.push(relevantMessageData);

    const spamMessages = messageCache.filter((msg) => messageCache.authorID === message.authorID && msg.timeStamp > (Date.now() - options.interval));

    if (spamMessages.length >= options.messageThreshold) {
        messageCache = messageCache.filter(message => !spamMessages.includes(message));
        await sendReplyMessage(message, message.channel, "Please stop spamming");
        await sendSpamReport(message.member, message.channel, client)
        message.channel.permissionOverwrites.create(message.author.id, { SEND_MESSAGES: false });
        setTimeout(async () => {
            message.channel.permissionOverwrites.create(message.author.id, { SEND_MESSAGES: true });
        }, 60000);
    }

};


module.exports = {
    spamHandler,
};