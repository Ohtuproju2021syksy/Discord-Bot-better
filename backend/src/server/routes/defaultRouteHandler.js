require("dotenv").config();
const router = require("express").Router();

router.all("/", (req, res) => {
  console.log("A");
  res.json(process.env.DISCORD_SERVER_INVITE);
});

module.exports = router;