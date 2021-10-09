const { createChannelToDatabase, findCourseFromDb } = require("../../services/service");

const execute = async (message, args, models) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    const guild = message.client.guild;
    const channelCache = guild.channels.cache;

    const courseTextChannels = channelCache.filter(c => c.type === "GUILD_TEXT" && c.name !== "general" && c.parentId != null);
    const channelsToSave = courseTextChannels.filter(c => !c.name.includes("_announcement") && !c.name.includes("_general"));
    const channelsAsArray = Array.from(channelsToSave.values());

    for (const channel in channelsAsArray) {
      const currentChannel = channelsAsArray[channel];
      const courseIdentifier = currentChannel.name.split("_")[0];
      const course = await findCourseFromDb(courseIdentifier, models.Course);
      await createChannelToDatabase(course.id, currentChannel.name, models.Channel);
    }
  }
};

module.exports = {
  prefix: true,
  name: "updatedatabase",
  description: "Save existing channels to database.",
  role: "admin",
  usage: "!updatedatabase",
  args: false,
  execute,
};