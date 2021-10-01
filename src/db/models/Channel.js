module.exports = (sequelize, DataTypes) => {
  return sequelize.define("channel", {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    courseId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: false,
    },
    bridged: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      unique: false,
    },
  }, {
    timestamps: false,
    freezeTableName: true,
  });
};

// Table channel {
//   id varchar [pk]
//   course_id varchar
//   name varchar
//   topic varchar
//   bridged boolean
// }