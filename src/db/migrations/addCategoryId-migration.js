"use strict";
const { STRING } = require("sequelize");

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn("course", "categoryId", {
      type: STRING,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("course", "categoryId");
  },
};