const { createCourseInvitationLink } = require("../../services/service");

const execute = async (message) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    const announcementChannels = message.guild.channels.cache.filter(c => c.name.includes("announcement"));
    announcementChannels.forEach(async aChannel => {
      const pinnedMessages = await aChannel.messages.fetchPinned();
      const invMessage = pinnedMessages.find(msg => msg.author === message.client.user && msg.content.includes("Invitation link for"));

      const courseName = aChannel.parent.name.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, "").trim();

      const updatedMsg = createCourseInvitationLink(courseName);
      await invMessage.edit(updatedMsg);
    });
  }
};

module.exports = {
  prefix: true,
  name: "updateinvlinks",
  description: "Update invitation links.",
  role: "admin",
  usage: "!updateinvlinks",
  args: false,
  execute,
};