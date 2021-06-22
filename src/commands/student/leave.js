const execute = async (message, args) => {
  const roleString = args;
  const member = message.member;

  const courseRoles = await message.guild.roles.cache
    .filter(role => (role.name === `${roleString} admin` || role.name === `${roleString}`))
    .map(role => role.name);
  if (courseRoles) throw new Error("Role does not exist or is not available");
  await member.roles.cache
    .filter(role => courseRoles.includes(role.name))
    .map(async role => await member.roles.remove(role));
  await member.fetch(true);
};

module.exports = {
  name: "leave",
  description: "Remove you from the course, e.g. `!leave ohpe`",
  args: true,
  joinArgs: true,
  guide: true,
  execute,
};
