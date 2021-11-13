require("dotenv").config();
const router = require("express").Router();
const passport = require("passport");
const { getRoles, addRole, getMember, addMember } = require("../api/api");
const { createCourseMemberToDatabase } = require("../../db/services/courseMemberService");
const { findCourseFromDb } = require("../../db/services/courseService");
const { findUserByDiscordId } = require("../../db/services/userService");
const models = require("../../db/dbInit");

router.get("/", passport.authenticate("discord", {
  failureRedirect: process.env.DISCORD_REDIRECT_URL + "/unauthorized",
  failureFlash: true,
}), async (req, res) => {
  console.log("redirected to discordAuth");
  const roles = await getRoles();
  const role = roles.find(r => r.id === req.authInfo.state.roleID);
  const member = await getMember(req.user.id);
  if (member.user) {
    await addRole(member.user, role);
  }
  else {
    await addMember(req.user, role);
  }
  const course = await findCourseFromDb(role.name, models.Course);
  const user = await findUserByDiscordId(req.user.id, models.User);
  if (course) {
    await createCourseMemberToDatabase(user.id, course.id, models.CourseMember);
  }
  res.redirect(process.env.DISCORD_SERVER_INVITE);
});

router.get("/unauthorized", (req, res) => {
  res.redirect("/error.html?error=" + req.flash("error")[0]);
});

module.exports = router;
