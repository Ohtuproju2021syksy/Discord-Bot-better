"use strict";
const { BOOLEAN } = require("sequelize");

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn("course", "locked", {
      type: BOOLEAN,
      defaultValue: false,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("course", "locked");
  },
};
