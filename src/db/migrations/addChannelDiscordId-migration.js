"use strict";
const { STRING } = require("sequelize");

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addColumn("channel", "discordId", {
      type: STRING,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("channel", "discordId");
  },
};