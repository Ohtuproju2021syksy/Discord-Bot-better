const Sequelize = require("sequelize");

const sequelize = new Sequelize("database", "username", "password", {
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  storage: "database.sqlite",
});

const Invites = require("./models/Invites")(sequelize, Sequelize.DataTypes);

sequelize.sync();

module.exports = { Invites };
