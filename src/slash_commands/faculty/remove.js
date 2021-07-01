const { deleteInvite } = require("../../service");
const { sendEphemeral } = require("../utils");
const { client } = require("../../index");

const createCategoryName = (courseString) => `📚 ${courseString}`;

const execute = async (interaction) => {
  const courseName = interaction.data.options[0].value.toLowerCase().trim();

  const guild = client.guild;

  sendEphemeral(client, interaction, `Deleted course ${courseName}.`);

  const courseString = createCategoryName(courseName);
  const category = guild.channels.cache.find(c => c.type === "category" && c.name === courseString);
  await Promise.all(guild.channels.cache
    .filter(c => c.parent === category)
    .map(async channel => await channel.delete()),
  );

  await deleteInvite(guild, courseName);

  await category.delete();

  await Promise.all(guild.roles.cache
    .filter(r => (r.name === `${courseName} admin` || r.name === courseName))
    .map(async role => await role.delete()),
  );
  client.emit("COURSES_CHANGED");
};

module.exports = {
  name: "remove",
  description: "Delete course.",
  usage: "[course name]",
  args: true,
  joinArgs: true,
  guide: true,
  role: "teacher",
  options: [
    {
      name: "course",
      description: "Course to delete.",
      type: 3,
      required: true,
    },
  ],
  execute,
};
