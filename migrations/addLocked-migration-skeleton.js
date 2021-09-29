"use strict";

/* run migration with
    npx sequelize-cli db:migrate
  in command prompt
*/

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn("course", "locked", {
          type: Sequelize.DataTypes.BOOLEAN,
          defaultValue: false,
        }, { transaction: t }),
      ]);
    });
  },
  down: (queryInterface) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn("course", "locked", { transaction: t }),
      ]);
    });
  },
};
