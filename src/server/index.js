require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
const session = require("express-session");
const passport = require("passport");
const discordAuthRoute = require("./routes/discordAuth");
const discordInviteRoute = require("./routes/invites");
require("./strategies/discordstrategy");

app.use(session ({
  secret: "ruttunen",
  saveUninitialized: false,
  resave:false,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use("/discordAuth", discordAuthRoute);
app.use("/invites", discordInviteRoute);

const server = app.listen(PORT, () => { console.log(`Server listening requests on port ${PORT}`); });

module.exports = server;
