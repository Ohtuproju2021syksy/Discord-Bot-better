const router = require("express").Router();

router.get("/:id", (req, res) => {
  res.redirect(process.env.URL);
});

module.exports = router;