const router = require("express").Router();
const passport = require("passport");

router.get("/:id", async (req, res, next) => {
  const { client } = require("../../index");
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const courseRole = guild.roles.cache.find(r => r.name === req.params.id);
  if (!courseRole) res.sendStatus(400);
  passport.authenticate("discord", {
    session: false,
    state: { courseName: req.params.id },
  })(req, res, next);
});

module.exports = router;