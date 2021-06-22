const Sequelize = require("sequelize");
const user = process.env.PGUSER;
const password = process.env.PGPASSWORD;
const host = process.env.PGHOST;
const port = process.env.PGPORT;
const db = process.env.PGDATABASE;

const sequelize = new Sequelize(`postgres://${user}:${password}@${host}:${port}/${db}`, {
  logging: false,
});

const Invites = require("./models/Invites")(sequelize, Sequelize.DataTypes);

sequelize.sync();

module.exports = { Invites, sequelize };
