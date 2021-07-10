const router = require("express").Router();
const passport = require("passport");

module.exports = (client) => {
  router.get("/:id", async (req, res, next) => {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const courseRole = guild.roles.cache.find(r => r.name === req.params.id);
    if (!courseRole) {
      res.sendStatus(400);
      return;
    }
    passport.authenticate("discord", {
      session: false,
      state: { courseRoleID: courseRole.id },
    })(req, res, next);
  });
  return router;
};
