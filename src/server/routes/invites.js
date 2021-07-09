const router = require("express").Router();
const passport = require("passport");

router.get("/:id", passport.authenticate("discord", {
  session: false,
  state: { courseName: "test" },
}));

module.exports = router;