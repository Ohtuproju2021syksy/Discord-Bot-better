const { sendEphemeral, sendEphemeralembed } = require("../utils");
const { MessageEmbed } = require("discord.js");
const { facultyRole, courseAdminRole, gitRepoUrl } = require("../../../../config.json");

const branch = process.env.NODE_ENV === "production" ? "main" : "dev";

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

const handleAllCommands = (title, color, embeds, adminData, roleData, studentData, client, interaction) => {
  const description = "Here's a list of commands you can use:\nArgument syntax [compulsatory] <optional>\nClick command to read GitHub command.md";
  embeds.push(createHeaderEmbed(title, description, color));
  if (adminData.length !== 0) embeds.push(createEmbed(adminData, false, "admin", "#ff001a"));
  if (roleData.length !== 0) embeds.push(createEmbed(roleData, false, facultyRole, "#ff0099"));
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
    const description = "Argument syntax [compulsatory] <optional>";
    embeds.push(createHeaderEmbed(title, description, color));
    embeds.push(createEmbed([command], false, command.role, getColor(command.role)));
    return sendEphemeralembed(client, interaction, embeds);
  }
};

const execute = async (interaction, client) => {
  const guild = client.guild;
  const member = guild.members.cache.get(interaction.member.user.id);
  const highestRole = getBestRole(member);
  const adminData = client.commands.map((c) => c).filter(command => member.roles.cache.find(role => role.name === command.role));
  const roleData = client.slashCommands.map(c => c.command)
    .filter(command => {
      if (command.role && highestRole === "admin") return true;
      return member.roles.cache.find(role => role.name.includes(command.role));
    });
  const studentData = client.slashCommands.map(c => c.command).filter(command => !command.role && command.name !== "auth");
  const title = `Hi ${member.displayName}!`;
  const embeds = [];
  const color = getColor(highestRole);
  if (!interaction.data.options) {
    return handleAllCommands(title, color, embeds, adminData, roleData, studentData, client, interaction);
  }
  else {
    return handleSingleCommand(title, color, embeds, adminData, roleData, studentData, client, interaction);
  }
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
