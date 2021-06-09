let invites;

const getInvites = () => {
  return invites;
};

const execute = async (client) => {
  invites = await client.guild.fetchInvites();
  console.log("Invites updated");
};

module.exports = {
  name: "inviteCreate",
  execute,
  invites: getInvites,
};
