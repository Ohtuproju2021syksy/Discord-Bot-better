const execute = (message) => {
  message.client.emit("guildMemberAdd", message.member);
};

module.exports = {
  name: "joinserver",
  description: "Test guildmemberadd event",
  args: false,
  joinArgs: false,
  test: true,
  execute,
};
