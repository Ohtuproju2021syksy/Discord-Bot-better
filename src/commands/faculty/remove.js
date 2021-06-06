const createCategoryName = (courseString) => `📚 ${courseString}`;

const execute = async (message, args) => {
  const courseName = args;
  const guild = message.guild;

  const courseString = createCategoryName(courseName);
  const category = guild.channels.cache.find(c => c.type === "category" && c.name === courseString);
  await Promise.all(guild.channels.cache
    .filter(c => c.parent === category || c === category)
    .map(async channel => await channel.delete()),
  );

  await Promise.all(guild.roles.cache
    .filter(r => (r.name === `${courseName} admin` || r.name === courseName))
    .map(async role => await role.delete()),
  );
};

module.exports = {
  name: "remove",
  description: "Delete course.",
  usage: "[course name]",
  args: true,
  joinArgs: true,
  guide: true,
  role: "teacher",
  execute,
};
