const { createNewGroup } = require("../../services/service");

const execute = async (message, args, Groups) => {
  await createNewGroup(args, Groups);
};

module.exports = {
  name: "bridge",
  description: "Add bridge to course",
  usage: "[channel name e.g. kurssi-1 not the course name] [telegram group id]",
  args: true,
  joinArgs: false,
  role: "teacher",
  execute,
};
