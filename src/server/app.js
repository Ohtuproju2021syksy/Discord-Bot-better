require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const discordAuth = require("./routes/discordAuth");
const discordJoin = require("./routes/join");
const authenticateFaculty = require("./routes/authenticateFaculty");
const defaultRouteHandler = require("./routes/defaultRouteHandler");
const defaultRouteErrorHandler = require("./routes/defaultRouteErrorHandler");
require("./strategies/discordstrategy");

const SequelizeStore = require("connect-session-sequelize")(session.Store);

module.exports = (client, sequelize) => {
  const app = express();
  const discordAuthRoute = discordAuth(client);
  const discordJoinRoute = discordJoin(client);
  const facultyAuthRoute = authenticateFaculty(client);

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      store: new SequelizeStore({
        db: sequelize,
      }),
      saveUninitialized: false,
      resave: false,
    }));

  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/", defaultRouteHandler);
  app.use("/discordAuth", discordAuthRoute);
  app.use("/join", discordJoinRoute);
  app.use("/authenticate_faculty", facultyAuthRoute);
  app.use("*", defaultRouteErrorHandler);

  return app;
};
