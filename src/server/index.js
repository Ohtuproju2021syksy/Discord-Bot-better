require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
const session = require("express-session");
const passport = require("passport");
const discordAuthRoute = require("./routes/discordAuth");
const discordInviteRoute = require("./routes/invite");
const defaultRoute = require("./routes/defaultRouteHandler");
const defaultRouteErrorHandler = require("./routes/defaultRouteErrorHandler");
require("./strategies/discordstrategy");

app.use(session ({
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave:false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/", defaultRoute);
app.use("/discordAuth", discordAuthRoute);
app.use("/invite", discordInviteRoute);
app.use("*", defaultRouteErrorHandler);

const server = app.listen(PORT, () => { console.log(`Server listening requests on port ${PORT}`); });

module.exports = server;
