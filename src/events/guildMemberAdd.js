const { getRoleFromCategory, updateGuide } = require("../service");

const execute = async (member, client) => {
  if (member.user.bot) return;
  const invs = client.guild.inv;
  const guildInvites = await member.guild.fetchInvites();

  const invite = guildInvites.find(i => invs.get(i.code).uses < i.uses);
  const invitedChannelName = invite.channel.parent.name;
  if (invitedChannelName.substring(0, 2) === "📚") {
    const roleName = await getRoleFromCategory(invitedChannelName);
    const role = await client.guild.roles.cache.find((r) => r.name === roleName);
    await member.roles.add(role);
    await updateGuide(client.guild);
  }
  client.guild.inv = guildInvites;
  const studentRole = await client.guild.roles.cache.find((r) => r.name === "student");
  await member.roles.add(studentRole);
  await member.fetch(true);
};

module.exports = {
  name: "guildMemberAdd",
  execute,
};