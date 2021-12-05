const { Sequelize } = require("sequelize");

const findCourseFromDb = async (courseName, Course) => {
  return await Course.findOne({
    where:
      { name: { [Sequelize.Op.iLike]: courseName } },
  });
};

const setCourseToPrivate = async (courseName, Course) => {
  const course = await findCourseFromDb(courseName, Course);

  if (course) {
    course.private = true;
    await course.save();
  }
};

const setCourseToPublic = async (courseName, Course) => {
  const course = await findCourseFromDb(courseName, Course);

  if (course) {
    course.private = false;
    await course.save();
  }
};

const setCourseToLocked = async (courseName, Course) => {
  const course = await findCourseFromDb(courseName, Course);

  if (course) {
    course.locked = true;
    await course.save();
  }
};

const setCourseToUnlocked = async (courseName, Course) => {
  const course = await findCourseFromDb(courseName, Course);

  if (course) {
    course.locked = false;
    await course.save();
  }
};

const createCourseToDatabase = async (courseCode, courseFullName, courseName, Course) => {
  const course = await findCourseFromDb(courseName, Course);

  if (!course) {
    return await Course.create({ code: courseCode, fullName: courseFullName, name: courseName, private: false });
  }
};

const removeCourseFromDb = async (courseName, Course) => {
  const course = await findCourseFromDb(courseName, Course);

  if (course) {
    await Course.destroy({
      where:
        { name: { [Sequelize.Op.iLike]: courseName } },
    });
  }
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

const findLockedCoursesFromDb = async (order, Course) => {
  return await Course.findAll({
    attributes: ["id", "code", "fullName", "name"],
    order: [order],
    where: {
      locked: true,
    },
    raw: true,
  });
};

const findUnlockedCoursesFromDb = async (order, Course) => {
  return await Course.findAll({
    attributes: ["id", "code", "fullName", "name"],
    order: [order],
    where: {
      locked: false,
    },
    raw: true,
  });
};

const findPrivateCoursesFromDb = async (order, Course) => {
  return await Course.findAll({
    attributes: ["id", "code", "fullName", "name"],
    order: [order],
    where: {
      private: true,
    },
    raw: true,
  });
};

const findPublicCoursesFromDb = async (order, Course) => {
  return await Course.findAll({
    attributes: ["id", "code", "fullName", "name"],
    order: [order],
    where: {
      private: false,
    },
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
  findLockedCoursesFromDb,
  findUnlockedCoursesFromDb,
  findPrivateCoursesFromDb,
  findPublicCoursesFromDb,
};