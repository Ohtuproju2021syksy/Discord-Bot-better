const SequelizeMock = require("sequelize-mock");

const dbMock = new SequelizeMock();

const Course = dbMock.define("Course", {
  code: "TKT-test",
  fullname: "test course",
  name: "test",
  telegramId: null,
  private: false,
  locked: false,
});

Course.$queryInterface.$useHandler(function(query, queryOptions) {
  if (query === "findOne") {
    if (queryOptions[0].where.name === "privateTest") {
      return Course.build({ name: "privateTest", private: true });
    }
  }
});

module.exports = {
  Course,
};