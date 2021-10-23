const { createCourseInvitationLink, getCourseNameFromCategory } = require("../../services/service");

const execute = async (message) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    const announcementChannels = message.guild.channels.cache.filter(c => c.name.includes("announcement"));
    announcementChannels.forEach(async aChannel => {
      const pinnedMessages = await aChannel.messages.fetchPinned();
      const invMessage = pinnedMessages.find(msg => msg.author === message.client.user && msg.content.includes("Invitation link for"));
      const courseName = getCourseNameFromCategory(aChannel.parent);
      const updatedMsg = createCourseInvitationLink(courseName);
      await invMessage.edit(updatedMsg);
    });
  }
};

module.exports = {
  prefix: true,
  name: "update_invitelinks",
  description: "Update invitation links.",
  role: "admin",
  usage: "!update_invitelinks",
  args: false,
  execute,
};