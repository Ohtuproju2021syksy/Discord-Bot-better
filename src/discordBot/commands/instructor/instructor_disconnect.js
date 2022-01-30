const { SlashCommandBuilder } = require("@discordjs/builders");
const { getChannelByDiscordId } = require("../../../db/services/channelService");
const { findUserByDiscordId } = require("../../../db/services/userService");
const { sendEphemeral, editEphemeral, editErrorEphemeral } = require("../../services/message");
const { confirmChoice } = require("../../services/confirm");
const { findCourseMember } = require("../../../db/services/courseMemberService");
const { getUserWithUserId } = require("../../services/service");

const execute = async (interaction, client, models) => {
  await sendEphemeral(interaction, "Disconnecting user from voice channel...");

  const channelModel = models.Channel;
  const courseMemberModel = models.CourseMember;

  const parameter = interaction.options.getString("user");
  if (!parameter.match(/(?<=<@!).*?(?=>)/)) {
    return await editErrorEphemeral(interaction, "Invalid parameters.");
  }
  const userToDisconnectID = parameter.match(/(?<=<@!).*?(?=>)/)[0];
  const commandUser = await findUserByDiscordId(interaction.member.user.id, models.User);
  const userToDc = await getUserWithUserId(client.guild, userToDisconnectID);
  const userToDcVoiceChannel = await getChannelByDiscordId(userToDc.voice.channelId, channelModel);
  console.log(userToDcVoiceChannel);


  // inside a course voice channel
  if (userToDcVoiceChannel?.courseId) {
    const commandUserCourseMember = await findCourseMember(commandUser.id, userToDcVoiceChannel.courseId, courseMemberModel);
    console.log(commandUserCourseMember);
    if (!commandUser.admin && !commandUser.faculty && !commandUserCourseMember.instructor) {
      return await editErrorEphemeral(interaction, "You don't have the permissions to do that.");
    }
    const confirm = await confirmChoice(interaction, `Confirm command: Disconnect user ${parameter} from voice channel`);

    if (!confirm) {
      return await editEphemeral(interaction, "Command declined");
    }
    userToDc.voice.setChannel(null);
    return await editEphemeral(interaction, `Disconnected user ${parameter} from voice channel`);
  }

  // inside a non-course voice channel
  if (!commandUser.admin && !commandUser.faculty) {
    return await editErrorEphemeral(interaction, "You don't have the permissions to do that.");
  }
  const confirm = await confirmChoice(interaction, `Confirm command: Disconnect user ${parameter} from voice channel`);

  if (!confirm) {
    return await editEphemeral(interaction, "Command declined");
  }
  userToDc.voice.disconnect();
  await editEphemeral(interaction, `Disconnected user ${parameter} from voice channel`);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("instructor_disconnect")
    .setDescription("Disconnect user from voice channel.")
    .setDefaultPermission(true)
    .addStringOption(option =>
      option.setName("user")
        .setDescription("User to disconnect.")
        .setRequired(true)),
  execute,
  usage: "/instructor_disconnect",
  description: "Disconnect user from voice channel.*",
};
