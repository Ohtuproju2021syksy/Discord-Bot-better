module.exports = (sequelize, DataTypes) => {
  return sequelize.define("invites", {
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    course: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    timestamps: false,
  });
};