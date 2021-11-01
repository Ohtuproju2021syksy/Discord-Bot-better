const router = require("express").Router();
const passport = require("passport");
const { getRoles, addRole, getMember, addMember } = require("../api/api");

router.get("/", passport.authenticate("discord", {
  failureRedirect: "/discordAuth/unauthorized",
  failureFlash: true,
}), async (req, res) => {
  console.log(req.user);
  const roles = await getRoles();
  const role = roles.find(r => r.id === req.authInfo.state.roleID);
  const member = await getMember(req.user.id);
  if (member.user) {
    await addRole(member.user, role);
  }
  else {
    await addMember(req.user, role);
  }
  res.redirect(process.env.DISCORD_SERVER_INVITE);
});

router.get("/unauthorized", (req, res) => {
  res.status(401).send(req.flash('error')[0]);
});

module.exports = router;
