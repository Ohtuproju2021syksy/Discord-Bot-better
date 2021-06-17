const Sequelize = require("sequelize");

const sequelize = new Sequelize("database", "username", "password", {
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  storage: "testDatabase.sqlite",
});

const Invites = require("../models/Invites")(sequelize, Sequelize.DataTypes);

sequelize.sync({ force: true });

module.exports = { Invites };
