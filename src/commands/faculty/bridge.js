const { Groups } = require("../../dbInit");

const execute = async (message, args) => {
  const courseName = args[0];
  const groupId = parseInt(args[1]);

  const newGroup = await Groups.create({ group: groupId, course: courseName });
  console.log(newGroup);
};

module.exports = {
  name: "bridge",
  description: "Add bridge to course",
  usage: "[course] [group id]",
  args: true,
  joinArgs: false,
  role: "teacher",
  execute,
};
