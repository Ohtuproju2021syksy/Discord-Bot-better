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

const execute = async (interaction, client, Groups, Course) => {
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

  let databaseValue = await Course.findOne({ where: { name: categoryName } }).catch((error) => console.log(error));

  if (!databaseValue) {
    databaseValue = await Course.create({ code: "change me", fullName: categoryName, name: categoryName });
  }

  const cooldown = used.get(categoryName);
  if (cooldown) {
    const timeRemaining = Math.floor(cooldown - Date.now());
    const time = msToMinutesAndSeconds(timeRemaining);
    return sendEphemeral(client, interaction, `Command cooldown [mm:ss]: you need to wait ${time}.`);
  }

  if (choice === "code") {
    if (databaseValue.code === databaseValue.name) {
      const change = await changeCourseNames(newValue, channel, category, guild);
      if (!change) return sendEphemeral(client, interaction, "Course name already exists");

      // save values to database
      databaseValue.code = newValue;
      databaseValue.name = newValue;
      await databaseValue.save();

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

    }
    else {
      databaseValue.code = newValue;
      await databaseValue.save();
    }
  }

  if (choice === "name") {
    databaseValue.fullName = newValue;
    await databaseValue.save();
  }

  if (choice === "nick") {
    const change = await changeCourseNames(newValue, channel, category, guild);
    if (!change) return sendEphemeral(client, interaction, "Course name already exists");

    // save values to database
    databaseValue.name = newValue;
    await databaseValue.save();

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
  }

  if ((choice === "code" && databaseValue.code === databaseValue.name) || choice === "nick") {
    const nameToCoolDown = trimCourseName(channel.parent, guild);
    const cooldownTimeMs = 1000 * 60 * 15;
    used.set(nameToCoolDown, Date.now() + cooldownTimeMs);
    handleCooldown(used, nameToCoolDown, cooldownTimeMs);
  }

  await client.emit("COURSES_CHANGED");
  await updateGuide(client.guild);

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