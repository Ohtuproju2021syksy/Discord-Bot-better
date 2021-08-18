const router = require("express").Router();

router.all("/", (req, res) => {
  res.redirect(process.env.DISCORD_SERVER_INVITE);
});

module.exports = router;