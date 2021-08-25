const { sendEphemeral } = require("../utils");
const { facultyRole, courseAdminRole } = require("../../../../config.json");
const prefix = "/";

const getBestRole = (member) => {
  let highestRole = member.roles.highest.name;
  if (highestRole !== "admin" && highestRole !== `${facultyRole}`) {
    highestRole = member.roles.cache.find((r) => r.name.includes(courseAdminRole)) ? courseAdminRole : undefined;
  }
  return highestRole;
};

const execute = async (interaction, client) => {
  const guild = client.guild;

  const member = guild.members.cache.get(interaction.member.user.id);
  const highestRole = getBestRole(member);
  const adminData = client.commands.map((c) => c).filter(command => member.roles.cache.find(role => role.name === command.role));
  const facultyData = client.slashCommands.map(c => c.command)
    .filter(command => command.role !== courseAdminRole)
    .filter(command => {
      if (command.role && (highestRole === "admin" || highestRole === facultyRole)) return true;
      return member.roles.cache.find(role => role.name.includes(command.role));
    });
  const courseAdminData = client.slashCommands.map(c => c.command)
    .filter(command => command.role === courseAdminRole)
    .filter(command => {
      if (command.role && (highestRole === "admin" || highestRole === facultyRole)) return true;
      return member.roles.cache.find(role => role.name.includes(command.role));
    });
  const studentData = client.slashCommands.map(c => c.command).filter(command => !command.role && command.name !== "auth");
  const commandsReadyToPrint = client.slashCommands.map(c => c.command)
    .filter(command => {
      if (!command.role || member.roles.cache.find((r) => r.name === command.role)) return true;
      return member.roles.cache.find(role => role.name.includes(command.role));
    });
  const data = [];
  if (!interaction.data.options) {
    data.push(`Hi **${member.displayName}**!\n`);
    data.push("Here's a list of commands you can use:\n");
    if (adminData.length !== 0) {
      data.push("Category: **admin**");
      data.push(adminData.map((command) => `**!${command.name}** - ${command.description}`).join("\n"));
      data.push("\n");
    }
    if (facultyData.length !== 0) {
      data.push(`Category: **${facultyRole}**`);
      data.push(facultyData.map((command) => `**${prefix}${command.name}** - ${command.description}`).join("\n"));
      data.push("\n");
    }
    if (courseAdminData.length !== 0) {
      data.push(`Category: **${courseAdminRole}**`);
      data.push(courseAdminData.map((command) => `**${prefix}${command.name}** - ${command.description}`).join("\n"));
      data.push("\n");
    }
    data.push("Category: **default**");
    data.push(studentData.map((command) => `**${prefix}${command.name}** - ${command.description}`).join("\n"));
    data.push("\n");
    data.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);
    return sendEphemeral(client, interaction, data.join("\n"));
  }

  const name = interaction.data.options[0].value.toLowerCase().trim();
  const command = commandsReadyToPrint.find(c => c.name.includes(name));

  if (!command) {
    return sendEphemeral(client, interaction, "that's not a valid command!");
  }

  data.push(`**Name:** ${command.name}`);
  data.push(`**Description:** ${command.description}`);
  data.push(`**Usage:** ${command.usage}`);
  return sendEphemeral(client, interaction, data.join(" \n"));
};

module.exports = {
  name: "help",
  description: "Get what and how to use commands.",
  usage: "/help <command name>",
  args: true,
  joinArgs: true,
  guide: true,
  options: [
    {
      name: "command",
      description: "command instructions",
      type: 3,
      required: false,
    },
  ],
  execute,
};
