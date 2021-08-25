const router = require("express").Router();
const passport = require("passport");
const { getRoles } = require("../api/api");

router.get("/:id", async (req, res, next) => {
  const roles = await getRoles();
  const role = roles.find(r => r.name === req.params.id);
  if (!role) {
    res.sendStatus(400);
    return;
  }
  passport.authenticate("discord", {
    session: false,
    state: { roleID: role.id },
  })(req, res, next);
});

module.exports = router;
