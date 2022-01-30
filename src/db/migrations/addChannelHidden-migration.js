"use strict";
const { BOOLEAN } = require("sequelize");

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn("channel", "hidden", {
      type: BOOLEAN,
      defaultValue: false,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("channel", "hidden");
  },
};
