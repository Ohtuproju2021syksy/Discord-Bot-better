const execute = async (member) => {
  member.guild.fetchInvites().then(guildInvites => {
    console.log(guildInvites);
  });
};

module.exports = {
  name: "guildMemberAdd",
  execute,
};