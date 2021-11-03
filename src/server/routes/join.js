const router = require("express").Router();
const passport = require("passport");
const { getRoles } = require("../api/api");

router.get("/:id", async (req, res, next) => {
  const roles = await getRoles();
  const role = roles.find(r => r.name === req.params.id);
  if (!role) {
    res.status(400).send("Incorrect course link. If you clicked it from a course page, please contact the course teacher. <br> Virheellinen kurssilinkki. Jos klikkasit linkkiä kurssisivulta, ota yhteys kurssin opettajaan.");
    return;
  }
  passport.authenticate("discord", {
    session: false,
    state: { roleID: role.id },
  })(req, res, next);
});

module.exports = router;
