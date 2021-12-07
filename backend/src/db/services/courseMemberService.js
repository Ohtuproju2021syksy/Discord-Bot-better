const findCourseMember = async (userId, courseId, CourseMember) => {
  return await CourseMember.findOne({
    where: {
      userId: userId,
      courseId: courseId,
    },
  });
};

const findAllCourseMembers = async (courseId, CourseMember) => {
  return await CourseMember.findAll({
    where: {
      courseId: courseId,
    },
  });
};

const findCourseMemberCount = async (courseId, CourseMember) => {
  return await CourseMember.count({
    where: {
      courseId: courseId,
    },
  });
};

const findAllCourseMembersByUser = async (userId, CourseMember) => {
  return await CourseMember.findAll({
    where: {
      userId: userId,
    },
  });
};

const createCourseMemberToDatabase = async (userId, courseId, CourseMember) => {
  const alreadyinuse = await findCourseMember(userId, courseId, CourseMember);
  if (!alreadyinuse) {
    return await CourseMember.create({ userId: userId, courseId: courseId });
  }
  return alreadyinuse;
};

const removeCourseMemberFromDb = async (userId, courseId, CourseMember) => {
  const coursemember = await findCourseMember(userId, courseId, CourseMember);
  if (coursemember) {
    return await CourseMember.destroy({
      where: {
        userId: userId,
        courseId: courseId,
      },
    });
  }
};

module.exports = {
  findCourseMember,
  findAllCourseMembers,
  createCourseMemberToDatabase,
  removeCourseMemberFromDb,
  findCourseMemberCount,
  findAllCourseMembersByUser,
};