const Sequelize = require("sequelize");
const password = process.env.POSTGRES_PASSWORD;

const sequelize = new Sequelize("postgres", "postgres", password, {
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  logging: false,
});

const Invites = require("./models/Invites")(sequelize, Sequelize.DataTypes);

sequelize.sync();

module.exports = { Invites, sequelize };
