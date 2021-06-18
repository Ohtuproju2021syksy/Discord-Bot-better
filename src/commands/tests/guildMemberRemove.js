const execute = (message) => {
  message.client.emit("guildMemberRemove", message.member);
};

module.exports = {
  name: "leaveserver",
  description: "Test guildmember remove event",
  args: false,
  joinArgs: false,
  test: true,
  execute,
};