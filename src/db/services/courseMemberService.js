const findCourseMember = async (userId, courseId, CourseMember) => {
  return await CourseMember.findOne({
    where:{
      userId: userId,
      courseId: courseId,
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
      where:{
        userId: userId,
        courseId: courseId,
      },
    });
  }
};

module.exports = {
  findCourseMember,
  createCourseMemberToDatabase,
  removeCourseMemberFromDb };