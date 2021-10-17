module.exports = (sequelize, DataTypes) => {
  return sequelize.define("user", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
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
  }, {
    freezeTableName: true,
    timestamps: true,
    updatedAt: false,
    tableName: 'joined_users'
  });
};