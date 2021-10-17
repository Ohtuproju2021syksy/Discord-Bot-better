module.exports = (sequelize, DataTypes) => {
  return sequelize.define("coursemember", {
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: false,
    },
    instructor: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      unique: false,
    },
  }, {
    freezeTableName: true,
    timestamps: true,
    updatedAt: false
  });
};