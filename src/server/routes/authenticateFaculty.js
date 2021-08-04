const router = require("express").Router();
const passport = require("passport");
const { facultyRole } = require("../../../config.json");

module.exports = (client) => {
  router.get("/", async (req, res, next) => {
    if (!req.headers.employeenumber) return res.sendStatus(401);
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const teacherRole = guild.roles.cache.find(r => r.name === facultyRole);
    if (!teacherRole) {
      res.sendStatus(400);
      return;
    }
    passport.authenticate("discord", {
      session: false,
      state: { roleID: teacherRole.id },
    })(req, res, next);
  });
  return router;
};
