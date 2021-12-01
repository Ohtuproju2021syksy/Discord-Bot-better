const { findCourseMember,
  findAllCourseMembers,
  createCourseMemberToDatabase,
  removeCourseMemberFromDb,
  findCourseMemberCount,
  findAllCourseMembersByUser } = require("../../../src/db/services/courseMemberService");

const courseMemberModelInstanceMock = {
  id: 1,
  instructor: false,
  userId: 1,
  courseId: 1,
};

const courseMemberModelMock = {
  findOne: jest.fn().mockResolvedValue(courseMemberModelInstanceMock),
  findAll: jest.fn().mockResolvedValue([courseMemberModelInstanceMock]),
  create: jest.fn().mockResolvedValue(courseMemberModelInstanceMock),
  destroy: jest.fn().mockResolvedValue(courseMemberModelInstanceMock),
  update: jest.fn().mockResolvedValue(courseMemberModelInstanceMock),
  count: jest.fn().mockResolvedValue([courseMemberModelInstanceMock]),
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("courseMemberService", () => {

  test("find a member of a course", async () => {
    await findCourseMember(1, 1, courseMemberModelMock);
    expect(courseMemberModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(courseMemberModelMock.findOne).toHaveBeenCalledWith({
      where:
        { userId: 1,
          courseId: 1 },
    });
  });

  test("find all course members", async () => {
    await findAllCourseMembers(1, courseMemberModelMock);
    expect(courseMemberModelMock.findAll).toHaveBeenCalledTimes(1);
    expect(courseMemberModelMock.findAll).toHaveBeenCalledWith({
      where:
        { courseId: 1 },
    });
  });

  test("find course member count", async () => {
    await findCourseMemberCount(1, courseMemberModelMock);
    expect(courseMemberModelMock.count).toHaveBeenCalledTimes(1);
    expect(courseMemberModelMock.count).toHaveBeenCalledWith({
      where:
        { courseId: 1 },
    });
  });

  test("find all course members by user id", async () => {
    await findAllCourseMembersByUser(1, courseMemberModelMock);
    expect(courseMemberModelMock.findAll).toHaveBeenCalledTimes(1);
    expect(courseMemberModelMock.findAll).toHaveBeenCalledWith({
      where:
        { userId: 1 },
    });
  });

  test("create new course member", async () => {
    courseMemberModelMock.findOne.mockResolvedValueOnce(null);
    const result = await createCourseMemberToDatabase(2, 1, courseMemberModelMock);
    expect(result).toBe(courseMemberModelInstanceMock);
    expect(courseMemberModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(courseMemberModelMock.findOne).toHaveBeenCalledWith({
      where:
        { userId: 2,
          courseId: 1,
        },
    });
    expect(courseMemberModelMock.create).toHaveBeenCalledTimes(1);
    expect(courseMemberModelMock.create).toHaveBeenCalledWith({ userId: 2, courseId: 1 });
  });

  test("create new course member doens't create if already exists", async () => {
    const courseMemberModelInstanceMock2 = {
      id: 2,
      instructor: false,
      userId: 2,
      courseId: 1,
    };
    courseMemberModelMock.findOne.mockResolvedValueOnce(courseMemberModelInstanceMock2);
    const result = await createCourseMemberToDatabase(2, 1, courseMemberModelMock);
    expect(result).toBe(courseMemberModelInstanceMock2);
    expect(courseMemberModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(courseMemberModelMock.findOne).toHaveBeenCalledWith({
      where:
        { userId: 2,
          courseId: 1,
        },
    });
    expect(courseMemberModelMock.create).toHaveBeenCalledTimes(0);
  });

  test("remove user from course", async () => {
    await removeCourseMemberFromDb(1, 1, courseMemberModelMock);
    expect(courseMemberModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(courseMemberModelMock.findOne).toHaveBeenCalledWith({
      where:
        { userId: 1,
          courseId: 1,
        },
    });
    expect(courseMemberModelMock.destroy).toHaveBeenCalledTimes(1);
    expect(courseMemberModelMock.destroy).toHaveBeenCalledWith({
      where:
        { userId: 1,
          courseId: 1,
        },
    });
  });

  test("remove user from course won't remove if doesn't exist", async () => {
    courseMemberModelMock.findOne.mockResolvedValueOnce(null);
    await removeCourseMemberFromDb(1, 1, courseMemberModelMock);
    expect(courseMemberModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(courseMemberModelMock.findOne).toHaveBeenCalledWith({
      where:
        { userId: 1,
          courseId: 1,
        },
    });
    expect(courseMemberModelMock.destroy).toHaveBeenCalledTimes(0);
  });

});