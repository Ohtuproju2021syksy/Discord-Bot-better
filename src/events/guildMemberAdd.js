const { updateGuide, findInvite } = require("../service");

const execute = async (member, client) => {
  const invs = client.guild.inv;
  const guildInvites = await member.guild.fetchInvites();
  const usedInvite = guildInvites.find(i => invs.get(i.code).uses < i.uses);
  if(usedInvite) {
    const invite = await findInvite(client.guild, usedInvite.code);
    const courseName = invite.course;
    if(courseName !== "guide") {
      const role = await client.guild.roles.cache.find((r) => r.name === courseName);
      await member.roles.add(role);
      await member.fetch(true);
    }
  }

  client.guild.inv = guildInvites;
  await updateGuide(client.guild);
};

module.exports = {
  name: "guildMemberAdd",
  execute,
};