module.exports = (sequelize, DataTypes) => {
  return sequelize.define("user", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      unique: false,
    },
    faculty: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      unique: false,
    },
    discordId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    freezeTableName: true,
    timestamps: true,
    updatedAt: false,
    tableName: "joined_users",
  });
};