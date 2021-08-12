const { setCoursePositionABC,
  findCategoryName,
  createCourseInvitationLink,
  findChannelWithNameAndType,
  updateGuide,
  msToMinutesAndSeconds,
  handleCooldown,
  trimCourseName } = require("../../services/service");
const { sendEphemeral } = require("../utils");
const { courseAdminRole, facultyRole } = require("../../../../config.json");

const used = new Map();

const changeCourseNames = async (newValue, channel, category, guild) => {
  if (guild.channels.cache.find(c => c.type === "category" && (c.name === `📚 ${newValue}` || c.name === `🔒 ${newValue}`))) return;
  if (category.name.includes("📚")) {
    await category.setName(`📚 ${newValue}`);
  }
  else {
    await category.setName(`🔒 ${newValue}`);
  }
  await Promise.all(guild.channels.cache
    .filter(c => c.parent === channel.parent)
    .map(async ch => {
      const newName = ch.name.replace(/.*_/, `${newValue}_`);
      await ch.setName(newName);
    },
    ));
  return true;
};

const changeCourseRoles = async (categoryName, newValue, guild) => {
  await Promise.all(guild.roles.cache
    .filter(r => (r.name === `${categoryName} ${courseAdminRole}` || r.name === categoryName))
    .map(async role => {
      if (role.name.includes("instructor")) {
        role.setName(`${newValue} instructor`);
      }
      else {
        role.setName(newValue);
      }
    },
    ));
};

const changeInvitationLink = async (channelAnnouncement, interaction) => {
  const pinnedMessages = await channelAnnouncement.messages.fetchPinned();
  const invMessage = pinnedMessages.find(msg => msg.author.id === interaction.application_id && msg.content.includes("Invitation link for"));
  const courseName = channelAnnouncement.parent.name.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, "").trim();

  const updatedMsg = createCourseInvitationLink(courseName);
  await invMessage.edit(updatedMsg);
};

const execute = async (interaction, client, Groups) => {
  const choice = interaction.data.options[0].value;
  const newValue = interaction.data.options[1].value.toLowerCase().trim();

  const guild = client.guild;
  const channel = guild.channels.cache.get(interaction.channel_id);

  if (!channel?.parent?.name?.startsWith("🔒") && !channel?.parent?.name?.startsWith("📚")) {
    return sendEphemeral(client, interaction, "This is not a course category, can not execute the command");
  }

  const categoryName = trimCourseName(channel.parent, guild);
  const category = findChannelWithNameAndType(channel.parent.name, "category", guild);
  const channelAnnouncement = guild.channels.cache.find(c => c.parent === channel.parent && c.name.includes("_announcement"));
  const channelGeneral = guild.channels.cache.find(c => c.parent === channel.parent && c.name.includes("_general"));
  const originalTopic = channelAnnouncement.topic;

  if (!originalTopic) {
    return sendEphemeral(client, interaction, "Course topic not found, can not execute the command");
  }

  const splitted = originalTopic.split(" :star: ");
  let newTopic;

  const cooldown = used.get(categoryName);
  if (cooldown) {
    const timeRemaining = Math.floor(cooldown - Date.now());
    const time = msToMinutesAndSeconds(timeRemaining);
    return sendEphemeral(client, interaction, `Command cooldown [mm:ss]: you need to wait ${time}.`);
  }
  if (choice === "code") {
    if (splitted[0] === splitted[2]) {
      newTopic = originalTopic.replace(splitted[0], newValue.toUpperCase());
      newTopic = newTopic.replace(splitted[2], newValue.toUpperCase());

      await channelAnnouncement.setTopic(newTopic);
      await channelGeneral.setTopic(newTopic);

      // change all course values
      const change = await changeCourseNames(newValue, channel, category, guild);
      if (!change) return sendEphemeral(client, interaction, "Course name already exists");
      await changeCourseRoles(categoryName, newValue, guild);
      await changeInvitationLink(channelAnnouncement, interaction);

      // change Telegram link if existing
      const group = await Groups.findOne({ where: { course: categoryName } }).catch((error) => console.log(error));
      if (group) {
        group.course = newValue;
        await group.save();
      }
      const newCategoryName = findCategoryName(newValue, guild);
      await setCoursePositionABC(guild, newCategoryName);

      await client.emit("COURSES_CHANGED");
      await updateGuide(client.guild);
    }
    else {
      newTopic = originalTopic.replace(splitted[0], newValue.toUpperCase());
      await channelAnnouncement.setTopic(newTopic);
      await channelGeneral.setTopic(newTopic);
    }
  }
  if (choice === "name") {
    newTopic = originalTopic.replace(splitted[1], newValue.toUpperCase());
    await channelAnnouncement.setTopic(newTopic);
    await channelGeneral.setTopic(newTopic);
  }

  if (choice === "nick") {
    newTopic = originalTopic.replace(splitted[2], newValue.toUpperCase());
    channelAnnouncement.setTopic(newTopic);
    channelGeneral.setTopic(newTopic);

    // change all course values
    const change = await changeCourseNames(newValue, channel, category, guild);
    if (!change) return sendEphemeral(client, interaction, "Course name already exists");
    await changeCourseRoles(categoryName, newValue, guild);
    await changeInvitationLink(channelAnnouncement, interaction);

    // change Telegram link if existing
    const group = await Groups.findOne({ where: { course: categoryName } }).catch((error) => console.log(error));
    if (group) {
      group.course = newValue;
      await group.save();
    }
    const newCategoryName = findCategoryName(newValue, guild);
    await setCoursePositionABC(guild, newCategoryName);

    await client.emit("COURSES_CHANGED");
    await updateGuide(client.guild);
  }

  const nameToCoolDown = trimCourseName(channel.parent, guild);
  const cooldownTimeMs = 1000 * 60 * 15;
  used.set(nameToCoolDown, Date.now() + cooldownTimeMs);
  handleCooldown(used, nameToCoolDown, cooldownTimeMs);

  return sendEphemeral(client, interaction, "Course information has been changed");
};

module.exports = {
  name: "edit",
  description: "Edit course code, name or nickname",
  args: true,
  joinArgs: true,
  guide: true,
  role: facultyRole,
  options: [
    {
      name: "options",
      description: "Edit current course",
      type: 3,
      required: true,
      choices: [
        {
          name: "coursecode",
          value: "code",
        },
        {
          name: "full name",
          value: "name",
        },
        {
          name: "nickname",
          value: "nick",
        },
      ],
    },
    {
      name: "new_value",
      description: "Give new value",
      type: 3,
      required: true,
    },
  ],
  execute,
};