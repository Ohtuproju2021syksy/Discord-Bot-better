module.exports = (sequelize, DataTypes) => {
  return sequelize.define("coursemember", {
    instructor: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      unique: false,
    },
  }, {
    freezeTableName: true,
    timestamps: true,
    updatedAt: false,
  });
};