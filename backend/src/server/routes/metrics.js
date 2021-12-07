const router = require("express").Router();
const register = require("../../promMetrics/promRegistry");

router.get("/", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
});

module.exports = router;