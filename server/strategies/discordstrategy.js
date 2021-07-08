const DiscordStrategy = require("passport-discord").Strategy;
const Discord = require("discord.js");
const passport = require("passport");

passport.use(new DiscordStrategy({
  clientID: process.env.SERVER_CLIENT_ID,
  clientSecret: process.env.SERVER_CLIENT_SECRET,
  callbackURL: process.env.SERVER_CLIENT_REDIRECT,
  scope: ["identify", "guilds", "guilds.join"],
  state: {},
}, async (accessToken, refreshToken, profile, done, state) => {
  const client = new Discord.Client();
  await client.login(process.env.BOT_TOKEN);
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const members = await guild.members.fetch();
  const member = members.get(profile.id);
  const role = guild.roles.cache.find(r => r.name === "test");
  if (member) {
    await member.roles.add(role);
    member.fetch(true);
  }
  else {
    await client.users.fetch(profile.id).then((user) => {
      // Add the user to the guild - make sure you pass the access token.
      guild.addMember(user, { accessToken, roles: [role] });
    });
  }
}));