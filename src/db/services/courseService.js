const { Sequelize } = require("sequelize");

const setCourseToPrivate = async (courseName, Course) => {
  const course = await Course.findOne({
    where:
      { name: { [Sequelize.Op.iLike]: courseName } },
  });
  if (course) {
    course.private = true;
    await course.save();
  }
};

const setCourseToPublic = async (courseName, Course) => {
  const course = await Course.findOne({
    where:
      { name: { [Sequelize.Op.iLike]: courseName } },
  });
  if (course) {
    course.private = false;
    await course.save();
  }
};

const setCourseToLocked = async (courseName, Course) => {
  const course = await Course.findOne({
    where:
      { name: { [Sequelize.Op.iLike]: courseName } },
  });
  if (course) {
    course.locked = true;
    await course.save();
  }
};

const setCourseToUnlocked = async (courseName, Course) => {
  const course = await Course.findOne({
    where:
      { name: { [Sequelize.Op.iLike]: courseName } },
  });
  if (course) {
    course.locked = false;
    await course.save();
  }
};

const createCourseToDatabase = async (courseCode, courseFullName, courseName, Course) => {
  const alreadyinuse = await Course.findOne({
    where:
      { name: { [Sequelize.Op.iLike]: courseName } },
  });
  if (!alreadyinuse) {
    return await Course.create({ code: courseCode, fullName: courseFullName, name: courseName, private: false });
  }
};

const removeCourseFromDb = async (courseName, Course) => {
  const course = await Course.findOne({
    where:
      { name: { [Sequelize.Op.iLike]: courseName } },
  });
  if (course) {
    await Course.destroy({
      where:
        { name: { [Sequelize.Op.iLike]: courseName } },
    });
  }
};

const findCourseFromDb = async (courseName, Course) => {
  return await Course.findOne({
    where:
      { name: { [Sequelize.Op.iLike]: courseName } },
  });
};

const findCourseFromDbById = async (courseId, Course) => {
  return await Course.findOne({
    where:
      { id: courseId },
  });
};

const findCoursesFromDb = async (order, Course, state) => {
  const filter = {
    true: { private: true },
    false: { private: false },
    undefined: {},
  };
  return await Course.findAll({
    attributes: ["id", "code", "fullName", "name"],
    order: [order],
    where: filter[state],
    raw: true,
  });
};

const findCourseFromDbWithFullName = async (courseFullName, Course) => {
  return await Course.findOne({
    where: {
      fullName: { [Sequelize.Op.iLike]: courseFullName },
    },
  });
};

const findCourseNickNameFromDbWithCourseCode = async (courseName, Course) => {
  return await Course.findOne({
    where: {
      code: { [Sequelize.Op.iLike]: courseName },
    },
  });
};

const findAllCourseNames = async (Course) => {
  const courseNames = [];
  const courses = await Course.findAll();
  for (const c of courses) {
    courseNames.push(c.name);
  }
  return courseNames;
};


module.exports = {
  setCourseToPrivate,
  setCourseToPublic,
  setCourseToLocked,
  setCourseToUnlocked,
  createCourseToDatabase,
  removeCourseFromDb,
  findCourseFromDb,
  findCourseFromDbWithFullName,
  findCoursesFromDb,
  findCourseNickNameFromDbWithCourseCode,
  findAllCourseNames,
  findCourseFromDbById,
};