module.exports = (sequelize, DataTypes) => {
  return sequelize.define("channel", {
    courseId: {
      type: DataTypes.INTEGER,
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
    defaultChannel: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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