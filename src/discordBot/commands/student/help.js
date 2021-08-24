const { sendEphemeral, sendEphemeralembed } = require("../utils");
const { MessageEmbed } = require("discord.js");
const { facultyRole, courseAdminRole, gitRepoUrl } = require("../../../../config.json");

const branch = process.env.NODE_ENV === "production" ? "dev" : "dev";

const createHeaderEmbed = (title, description, color) => {
  color = color ?? "#ff0099";
  return new MessageEmbed()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setFooter("\u2800".repeat(70));
};

const createEmbed = (commands, note, role, color) => {
  role = role ?? "default";
  const usages = commands.map((c) => `[${c.usage}](${gitRepoUrl}/tree/${branch}/documentation/commands/${c.name}.md)`);
  const descs = commands.map((c) => c.description);
  const exampleEmbed = new MessageEmbed()
    .setColor(color)
    .setDescription(`Category: ${role}`)
    .addField("Command" + "\u2800".repeat(20), usages.join("\n"), true)
    .addField("Description" + "\u2800".repeat(18), descs.join("\n"), true);
  note ?
    exampleEmbed
      .addField("\u2800".repeat(20), "*Command can be used without argument only in course channels.")
      .setFooter("\u2800".repeat(70)) :
    exampleEmbed.setFooter("\u2800".repeat(70));
  return exampleEmbed;
};

const getColor = (roleName) => {
  switch (roleName) {
    case "admin":
      return "#ff001a";
    case `${facultyRole}`:
      return "#ff0099";
    case `${courseAdminRole}`:
      return "#ff0099";
    default:
      return "#0099ff";
  }
};

const getBestRole = (member) => {
  let highestRole = member.roles.highest.name;
  if (highestRole !== "admin" && highestRole !== `${facultyRole}`) {
    highestRole = member.roles.cache.find((r) => r.name.includes(courseAdminRole)) ? courseAdminRole : undefined;
  }
  return highestRole;
};

const handleAllCommands = (title, color, embeds, adminData, facultyData, courseAdminData, studentData, client, interaction) => {
  const description = "Here's a list of commands you can use:\nArgument syntax [compulsatory] <optional>\nClick command to read GitHub command.md";
  embeds.push(createHeaderEmbed(title, description, color));
  if (adminData.length !== 0) embeds.push(createEmbed(adminData, false, "admin", "#ff001a"));
  if (facultyData.length !== 0) embeds.push(createEmbed(facultyData, false, facultyRole, "#ff0099"));
  if (courseAdminData.length !== 0) embeds.push(createEmbed(courseAdminData, false, courseAdminRole, "#ff0099"));
  embeds.push(createEmbed(studentData, true, "default", "#0099ff"));
  return sendEphemeralembed(client, interaction, embeds);
};

const handleSingleCommand = (title, color, embeds, adminData, roleData, studentData, client, interaction) => {
  const data = adminData.concat(roleData, studentData);
  const name = interaction.data.options[0].value.toLowerCase().trim();
  const command = data.find(c => c.name.includes(name));
  if (!command) {
    return sendEphemeral(client, interaction, "Error: Invalid command name!");
  }
  else {
    const description = "Argument syntax [compulsatory] <optional>\nClick command to read GitHub command.md";
    embeds.push(createHeaderEmbed(title, description, color));
    embeds.push(createEmbed([command], false, command.role, getColor(command.role)));
    return sendEphemeralembed(client, interaction, embeds);
  }
};

const executeEmbed = async (interaction, client) => {
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
  const title = `Hi ${member.displayName}!`;
  const embeds = [];
  const color = getColor(highestRole);
  if (!interaction.data.options) {
    return handleAllCommands(title, color, embeds, adminData, facultyData, courseAdminData, studentData, client, interaction);
  }
  else {
    return handleSingleCommand(title, color, embeds, adminData, facultyData, studentData, client, interaction);
  }
};

const prefix = "/";

const executeEphemeral = async (interaction, client) => {
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
  data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);
  return sendEphemeral(client, interaction, data.join(" \n"));
};

const execute = async (interaction, client) => {
  client.guild.channels.cache.get(interaction.channel_id).name === "asiakastapaamiset" ? executeEmbed(interaction, client) : executeEphemeral(interaction, client);
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
