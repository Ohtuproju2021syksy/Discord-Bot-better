module.exports = (sequelize, DataTypes) => {
  return sequelize.define("groups", {
    groupId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    course: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    timestamps: false,
  });
};
