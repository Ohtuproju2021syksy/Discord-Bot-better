const { SlashCommandBuilder } = require("@discordjs/builders");
const { sendEphemeral, editEphemeral, confirmChoice } = require("../../services/message");
const { Course } = require("../../../db/dbInit");
const { facultyRole } = require("../../../../config.json");
const { findCourseFromDb, findCategoryWithCourseName } = require("../../services/service");


const execute = async (interaction, client) => {

  await sendEphemeral(interaction, "Deleting bridge...");
  const guild = client.guild;
  const courseName = interaction.options.getString("course").trim();


  const confirm = await confirmChoice(interaction, "Delete the bridge to Telegram on course: " + courseName);
  if (!confirm) {
    return await editEphemeral(interaction, "Command declined");
  }

  const category = await findCategoryWithCourseName(courseName, guild);
  if (!category) {
    return await editEphemeral(interaction, `Invalid course name: ${courseName}`);
  }

  const databaseValue = await findCourseFromDb(courseName, Course);
  if (!databaseValue.telegramId) {
    return await editEphemeral(interaction, `Course: ${courseName} does not have a Telegram bridge!`);
  }

  databaseValue.telegramId = null;
  await databaseValue.save();

  return await editEphemeral(interaction, `Deleted Telegram bridge from course: ${courseName}`);
};


module.exports = {
  data: new SlashCommandBuilder()
    .setName("delete_bridge")
    .setDescription("Delete the bridge to the assigned Telegram group of this course")
    .setDefaultPermission(false)
    .addStringOption(option =>
      option.setName("course")
        .setDescription("Delete bridge of given course")
        .setRequired(true)),
  execute,
  usage: "/delete_bridge",
  description: "Delete the bridge to the assigned Telegram group of this course",
  roles: ["admin", facultyRole],
};