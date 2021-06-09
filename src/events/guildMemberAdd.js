const { invites } = require("./inviteCreate.js");

const execute = async (member) => {
  const guildInvites = await member.guild.fetchInvites();
  const invs = invites();
  const invite = guildInvites.find(i => invs.get(i.code).uses < i.uses);

  const roleName = invite.channel.parent.name.substring(3);
  const role = member.guild.roles.cache.find(
    r => r.name === roleName,
  );

  await member.roles.add(role);
  await member.fetch(true);
};

module.exports = {
  name: "guildMemberAdd",
  execute,
};