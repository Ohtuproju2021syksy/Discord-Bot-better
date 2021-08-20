const router = require("express").Router();
const passport = require("passport");
const { getRoles, addRole, getMember, addMember } = require("../api/api");

router.get("/", passport.authenticate("discord", {
  failureRedirect: "/discord/discordAuth/unauthorized",
}), async (req, res) => {
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
  res.sendStatus(401);
});

module.exports = router;
