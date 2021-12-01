require("dotenv").config();
const router = require("express").Router();
const passport = require("passport");
const { getRoles, addRole, getMember, addMember } = require("../api/api");
const { createCourseMemberToDatabase } = require("../../db/services/courseMemberService");
const { findCourseFromDb } = require("../../db/services/courseService");
const { findUserByDiscordId, saveFacultyRoleToDb, createUserToDatabase } = require("../../db/services/userService");
const models = require("../../db/dbInit");
const { facultyRole } = require("../../../config.json");

router.get("/", passport.authenticate("discord", {
  failureRedirect: process.env.DISCORD_REDIRECT_URL + "/unauthorized",
  failureFlash: true,
}), async (req, res) => {
  const roles = await getRoles();
  const role = roles.find(r => r.id === req.authInfo.state.roleID);
  const teacherRole = roles.find(r => r.name === facultyRole);
  const member = await getMember(req.user.id);
  if (member.user) {
    await addRole(member.user, role);
  }
  else {
    await addMember(req.user, role);
    const id = req.user.id;
    const username = req.user.username;
    await createUserToDatabase(id, username, models.User);
  }
  const user = await findUserByDiscordId(req.user.id, models.User);
  if (role.id === teacherRole.id) {
    await saveFacultyRoleToDb(user.discordId, models.User);
  }
  const course = await findCourseFromDb(role.name, models.Course);
  if (course) {
    await createCourseMemberToDatabase(user.id, course.id, models.CourseMember);
  }
  res.redirect(process.env.DISCORD_SERVER_INVITE);
  //res.status(200);
});

router.get("/unauthorized", (req, res) => {
  res.redirect('/?msg=' + req.flash("error")[0]);
  //res.redirect('/');
});

module.exports = router;
