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
    private: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      unique: false,
    },
    locked: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      unique: false,
    },
    categoryId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  }, {
    timestamps: false,
    freezeTableName: true,
  });
};
