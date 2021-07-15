module.exports = (sequelize, DataTypes) => {
  return sequelize.define("groups", {
    group: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    course: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    timestamps: false,
  });
};
