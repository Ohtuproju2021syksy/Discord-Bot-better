let invites;

const getInvites = () => {
  return invites;
};

const execute = async (client) => {
  client.guild = await client.guilds.fetch(process.env.GUILD_ID);
  invites = await client.guild.fetchInvites();
  console.log("Invites updated");
};

module.exports = {
  name: "inviteCreate",
  execute,
  invites: getInvites,
};
