require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const discordAuth = require("./routes/discordAuth");
const discordJoin = require("./routes/join");
const defaultRouteHandler = require("./routes/defaultRouteHandler");
const defaultRouteErrorHandler = require("./routes/defaultRouteErrorHandler");
require("./strategies/discordstrategy");

module.exports = (client) => {
  const app = express();
  const discordAuthRoute = discordAuth(client);
  const discordJoinRoute = discordJoin(client);

  app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/", defaultRouteHandler);
  app.use("/discordAuth", discordAuthRoute);
  app.use("/join", discordJoinRoute);
  app.use("*", defaultRouteErrorHandler);

  return app;
};
