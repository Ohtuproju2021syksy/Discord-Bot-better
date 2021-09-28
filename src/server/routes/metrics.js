const router = require("express").Router();
const { register, initPromRegistry } = require("../../promMetrics/promRegistry");

initPromRegistry();

router.get("/", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
});

module.exports = router;