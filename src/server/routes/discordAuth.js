const router = require("express").Router();
const passport = require("passport");

<<<<<<< HEAD
module.exports = (client) => {
  router.get("/", passport.authenticate("discord", {
    failureRedirect: "/discordAuth/unauthorized",
  }), async (req, res) => {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const courseRole = guild.roles.cache.get(req.authInfo.state.courseRoleID);
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

  router.get("/unauthorized", (req, res) => {
    res.sendStatus(401);
  });
  return router;
};
=======
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
>>>>>>> a9dc541 (Update server)
