const { getRoleFromCategory, findOrCreateRoleWithName } = require("../service");

const prefix = process.env.PREFIX;
const GUIDE_CHANNEL_NAME = "guide";
const FACULTY_ROLE = "faculty";

const execute = async (message, client) => {
  if (!message.content.startsWith(prefix)) return;

  let args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!client.commands.has(commandName)) return;
  const command = client.commands.get(commandName);

  if (command.role && !message.member.roles.cache.find(r => r.name === command.role)) {
    return message.channel.send("You have no power here!");
  }
  if (command.args && !args.length) {
    return message.channel.send(`You didn't provide any arguments, ${message.author}!`);
  }
  if (command.joinArgs) {
    args = args.join(" ");
  }

  try {
    await command.execute(message, args);
    if (command.guide) {
      await updateGuide(message.guild);
    }
    await message.react("✅");
  }
  catch (error) {
    console.error(error);
    await message.react("❌");
  }
};

const updateFaculty = async (guild) => {
  const facultyRole = await findOrCreateRoleWithName(FACULTY_ROLE, guild);
  const usersWhoShouldBeFaculty = guild.roles.cache
    .filter((role) => role.name.includes("admin"))
    .reduce((acc, role) => [...acc, ...role.members.array()], []);

  for (const member of usersWhoShouldBeFaculty) {
    if (!member.roles.cache.find((role) => role.id === facultyRole.id)) {
      await member.roles.add(facultyRole);
      await member.fetch(true);
      console.log("Gave faculty to", member.nickname || member.user.username);
    }
  }
};

const updateGuideMessage = async (message) => {
  const guild = message.guild;

  const rows = guild.channels.cache
    .filter((ch) => ch.type === "category" && ch.name.startsWith("📚"))
    .map((ch) => {
      const courseFullName = ch.name.replace("📚", "").trim();
      const courseRole = getRoleFromCategory(ch.name);
      const count = guild.roles.cache.find(
        (role) => role.name === courseRole,
      ).members.size;
      return `  - ${courseFullName} \`!join ${courseRole}\` 👤${count}`;
    }).sort((a, b) => a.localeCompare(b));

  const commands = guild.channels.cache.find(
    (channel) => channel.name === "commands",
  );

  const newContent = `
Käytössäsi on seuraavia komentoja:
  - \`!join\` jolla voit liittyä kurssille
  - \`!leave\` jolla voit poistua kurssilta
Esim: \`!join ohpe\`
  
You have the following commands available:
  - \`!join\` which you can use to join a course
  - \`!leave\` which you can use to leave a course
For example: \`!join ohpe\`

Kurssit / Courses:
${rows.join("\n")}

In course specific channels you can also list instructors \`!instructors\`

See more with \`!help\` and test out the commands in <#${commands.id}> channel!
`;

  await message.edit(newContent);
};

const updateGuide = async (guild) => {
  await updateFaculty(guild);
  const channel = guild.channels.cache.find(
    (c) => c.name === GUIDE_CHANNEL_NAME,
  );
  const messages = await channel.messages.fetchPinned(true);
  const message = messages.first();
  await updateGuideMessage(message);
};

module.exports = {
  name: "message",
  execute,
};
