const router = require("express").Router();

router.all("*", (req, res) => {
  res.redirect("/");
});

module.exports = router;