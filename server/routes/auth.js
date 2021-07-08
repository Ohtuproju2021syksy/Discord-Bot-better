const router = require("express").Router();
const passport = require("passport");

router.get("/:id",passport.authenticate("discord", { state: "test" }));

router.get("/redirect", passport.authenticate("discord", {
  failureRedirect: "/forbidden",
}), (req, res) => {
  res.send(200);
});

module.exports = router;