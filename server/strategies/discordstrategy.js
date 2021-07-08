const DiscordStrategy = require("passport-discord").Strategy;
const Discord = require("discord.js");
const passport = require("passport");

passport.use(new DiscordStrategy({
  clientID: process.env.BOT_TEST_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/redirect",
  scope: ["identify", "guilds", "guilds.join"],
  state: true,
}, async (request, response, accessToken, refreshToken, profile, done) => {
  console.log(profile.id);
  const client = new Discord.Client();
  await client.login(process.env.BOT_TOKEN);
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const roles = await guild.roles.fetch();
  const courseRole = roles.cache.find(r => r.name === request.query.state);
  if (!courseRole) response.redirect(process.env.SERVER_URL);
  const member = guild.members.cache.get(profile.id);
  if (member) {
    await member.roles.add(courseRole);
    response.json({ courseRole, member });
  }
  else {
    client.users.fetch(profile.id)
      .then((user) => guild.addMember(user, { accessToken, roles: [courseRole.id] }));
    response.redirect(process.env.SERVER_URL);
  }

// response.json({ courseRole, member });
// response.json({ status: "authentication failed" });
},
));