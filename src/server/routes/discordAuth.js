const router = require("express").Router();
const passport = require("passport");

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
