require("dotenv").config();
const Sequelize = require("sequelize");
const password = process.env.POSTGRES_PASSWORD;

let username = process.env.POSTGRES_USERNAME;
if (!username) {
  username = "postgres";
}

const sequelize = new Sequelize("postgres", username, password, {
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  logging: false,
});

const Course = require("./models/Course")(sequelize, Sequelize.DataTypes);
const Channel = require("./models/Channel")(sequelize, Sequelize.DataTypes);
const User = require("./models/User")(sequelize, Sequelize.DataTypes);
const CourseMember = require("./models/CourseMember")(sequelize, Sequelize.DataTypes);

Channel.belongsTo(Course, {
  foreignKeyConstraint: true, onDelete: "cascade",
});

CourseMember.belongsTo(User, {
  foreignKeyConstraint: true, onDelete: "cascade",
});

CourseMember.belongsTo(Course, {
  foreignKeyConstraint: true, onDelete: "cascade",
});

module.exports = {
  Course,
  Channel,
  User,
  CourseMember,
  sequelize };
