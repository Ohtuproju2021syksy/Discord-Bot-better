const router = require("express").Router();
const passport = require("passport");
const { facultyRole } = require("../../../config.json");
const { getRoles } = require("../api/api");
const models = require("../../db/dbInit");
const { saveFacultyRoleToDb } = require("../../db/services/userService");

router.get("/", async (req, res, next) => {
  if (!req.headers.employeenumber) return res.sendStatus(401);
  const roles = await getRoles();
  const teacherRole = roles.find(r => r.name === facultyRole);
  if (!teacherRole) {
    res.sendStatus(400);
    return;
  }
  passport.authenticate("discord", {
    session: false,
    state: { roleID: teacherRole.id },
  }, function(err, user) {
    if (user) {
      saveFacultyRoleToDb(req.user.id, models.User);
    }
  })(req, res, next);
});

module.exports = router;
