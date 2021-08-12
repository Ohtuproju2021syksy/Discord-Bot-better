module.exports = (sequelize, DataTypes) => {
  return sequelize.define("course", {
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    telegramId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  }, {
    timestamps: false,
    freezeTableName: true,
  });
};
