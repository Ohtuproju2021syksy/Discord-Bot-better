const router = require("express").Router();
const passport = require("passport");

router.get("/", passport.authenticate("discord", {
  failureRedirect: "/forbidden",
}), async (req, res) => {
  const { client } = require("../../index");
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const courseRole = guild.roles.cache.find(r => r.name === req.authInfo.state.courseName);
  const member = guild.members.cache.get(req.user.id);
  if (member) {
    await member.roles.add(courseRole);
  }
  else {
    client.users.fetch(req.user.id)
      .then((user) => guild.addMember(user, { accessToken: req.user.accessToken, roles: [courseRole.id] }));
  }
  res.redirect(process.env.DISCORD_SERVER_INVITE);
});

module.exports = router;