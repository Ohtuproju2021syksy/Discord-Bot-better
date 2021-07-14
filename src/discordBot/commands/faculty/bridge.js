const { createNewGroup } = require("../../services/service");

const execute = async (message, args, Groups) => {
  await createNewGroup(args, Groups);
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
