const DiscordStrategy = require("passport-discord").Strategy;
const passport = require("passport");

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new DiscordStrategy({
  clientID: process.env.BOT_TEST_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/discordAuth",
  scope: ["identify", "guilds", "guilds.join"],
  store: true,
}, async (accessToken, refreshToken, profile, done) => {
  done(null, profile);
},
));