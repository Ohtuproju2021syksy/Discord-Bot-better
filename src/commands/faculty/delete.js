const createCategoryName = (courseString) => `📚 ${courseString}`;

const findAndDeleteChannel = (channelObject) => {
  return channelObject.delete();
};

const findAndDeleteRole = (role) => {
  return role.delete();
};

const deleteCourse = async (user, courseString) => {
  const { guild } = context;
  if (user.roles.highest.name !== "admin") { throw new Error("You have no power here!"); }
  const courseString2 = createCategoryName(courseString);
  const category = guild.channels.cache.find(c => c.type === "category" && c.name === courseString2);
  await guild.channels.cache.map(c => c).filter(c => (c.parent === category || (c.type === "category" && c.name === courseString2))).reduce(async (promise, channel) => {
    await promise;
    return findAndDeleteChannel(channel);
  }, Promise.resolve());

  await guild.roles.cache.map(r => r).filter(r => (r.name === `${courseString} admin` || r.name === `${courseString}`)).reduce(async (promise, role) => {
    await promise;

    return findAndDeleteRole(role);
  }, Promise.resolve());

};


const execute = async (message, args) => {
  const who = message.member;
  await deleteCourse(who, args, message.guild);
};

module.exports = {
  name: "delete",
  description: "Delete course.",
  usage: "[course name]",
  args: true,
  role: "admin",
  execute,
  deleteCourse,
};