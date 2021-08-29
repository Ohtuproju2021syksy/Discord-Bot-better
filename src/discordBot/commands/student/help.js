const { SlashCommandBuilder } = require("@discordjs/builders");
const { sendErrorEphemeral, sendEphemeral } = require("../../services/message");
const { facultyRole, courseAdminRole } = require("../../../../config.json");
const prefix = "/";

const getBestRole = (member) => {
  let highestRole = member.roles.highest.name;
  if (highestRole !== "admin" && highestRole !== `${facultyRole}`) {
    highestRole = member.roles.cache.find((r) => r.name.includes(courseAdminRole)) ? courseAdminRole : undefined;
  }
  return highestRole;
};

const handleAllCommands = async (interaction, member, adminData, facultyData, courseAdminData, studentData) => {
  const data = [];
  data.push(`Hi **${member.displayName}**!\n`);
  data.push("Here's a list of commands you can use:\n");
  if (adminData.size) {
    data.push("Category: **admin**");
    data.push(adminData.map((command) => `**${command.usage}** - ${command.description}`).join("\n"));
    data.push("\n");
  }
  if (facultyData.size) {
    data.push(`Category: **${facultyRole}**`);
    data.push(facultyData.map((command) => `**${command.usage}** - ${command.description}`).join("\n"));
    data.push("\n");
  }
  if (courseAdminData.size) {
    data.push(`Category: **${courseAdminRole}**`);
    data.push(courseAdminData.map((command) => `**${command.usage}** - ${command.description}`).join("\n"));
    data.push("\n");
  }
  data.push("Category: **default**");
  data.push(studentData.map((command) => `**${command.usage}** - ${command.description}`).join("\n"));
  data.push("\n");
  data.push("*Commands can be only in course channels");
  data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);
  return await sendEphemeral(interaction, data.join("\n"));
};

const handleSingleCommand = async (interaction, member, commandsReadyToPrint) => {
  const name = interaction.options.getString("command");
  const command = commandsReadyToPrint.find(c => c.data.name.includes(name));

  if (!command) {
    return await sendErrorEphemeral(interaction, "that's not a valid command!");
  }
  const data = [];
  data.push(`Hi **${member.displayName}**!\n`);
  data.push(`Command **${command.data.name}** info:\n`);
  data.push(`**Name:** ${command.data.name}`);
  data.push(`**Description:** ${command.description}`);
  data.push(`**Usage:** ${command.usage}`);
  return await sendEphemeral(interaction, data.join(" \n"));
};

const execute = async (interaction, client) => {
  const guild = client.guild;
  const member = guild.members.cache.get(interaction.member.user.id);
  const highestRole = getBestRole(member);
  const adminData = client.commands.filter(command => member.roles.cache.find(role => role.name === command.role));
  const facultyData = client.slashCommands
    .filter(command => command.roles)
    .filter(command => !command.roles.includes(courseAdminRole))
    .filter(command => {
      if (highestRole === "admin" || highestRole === facultyRole) return true;
      return member.roles.cache.find(role => role.name.includes(command.role));
    });
  const courseAdminData = client.slashCommands
    .filter(command => command.roles)
    .filter(command => command.roles.includes(courseAdminRole))
    .filter(command => {
      if (highestRole === "admin" || highestRole === facultyRole) return true;
      return member.roles.cache.find(role => role.name.includes(command.role));
    });
  const studentData = client.slashCommands.filter(command => !command.roles && command.name !== "auth");
  const commandsReadyToPrint = client.slashCommands
    .filter(command => {
      if (!command.role || member.roles.cache.find((r) => r.name === command.role)) return true;
      return member.roles.cache.find(role => role.name.includes(command.role));
    });
  if (!interaction.options.getString("command")) await handleAllCommands(interaction, member, adminData, facultyData, courseAdminData, studentData);
  else handleSingleCommand(interaction, member, commandsReadyToPrint);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get what and how to use commands.")
    .setDefaultPermission(true)
    .addStringOption(option =>
      option.setName("command")
        .setDescription("command instructions")
        .setRequired(false)),
  execute,
  usage: "/help <command name>",
  description: "Get what and how to use commands.",
};
