const router = require("express").Router();
const passport = require("passport");

module.exports = (client) => {
  router.get("/", async (req, res, next) => {
    if (!req.headers.employeenumber) res.sendStatus(401);
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const facultyRole = guild.roles.cache.find(r => r.name === "faculty");
    if (!facultyRole) {
      res.sendStatus(400);
      return;
    }
    passport.authenticate("discord", {
      session: false,
      state: { roleID: facultyRole.id },
    })(req, res, next);
  });
  return router;
};
