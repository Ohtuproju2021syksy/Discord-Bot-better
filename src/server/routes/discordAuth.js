const router = require("express").Router();
const passport = require("passport");

module.exports = (client) => {
  router.get("/", passport.authenticate("discord", {
    failureRedirect: "/discord/discordAuth/unauthorized",
  }), async (req, res) => {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const role = guild.roles.cache.get(req.authInfo.state.roleID);
    const member = guild.members.cache.get(req.user.id);
    if (member) {
      await member.roles.add(role);
    }
    else {
      client.users.fetch(req.user.id)
        .then((user) => guild.addMember(user, { accessToken: req.user.accessToken, roles: [role.id] }));
    }
    res.redirect(process.env.DISCORD_SERVER_INVITE);
  });

  router.get("/unauthorized", (req, res) => {
    res.sendStatus(401);
  });
  return router;
};
