const { setCourseToPrivate, setCourseToPublic, setCourseToLocked, setCourseToUnlocked, removeCourseFromDb, createCourseToDatabase, findCourseFromDb, findCourseFromDbById, findCoursesFromDb, findCourseFromDbWithFullName, findCourseNickNameFromDbWithCourseCode, findAllCourseNames } = require("../../../src/db/services/courseService");

const courseModelInstanceMock = {
  id: 1,
  code: "TKT-test",
  fullname: "test course",
  name: "test",
  telegramId: null,
  private: false,
  locked: false,
  save: jest.fn(),
};

const courseModelMock = {
  findOne: jest.fn().mockResolvedValue(courseModelInstanceMock),
  destroy: jest.fn().mockResolvedValue(courseModelInstanceMock),
  create: jest.fn().mockResolvedValue(courseModelInstanceMock),
  findAll: jest.fn().mockResolvedValue([courseModelInstanceMock]),
};


afterEach(() => {
  jest.clearAllMocks();
});

describe("courseService", () => {
  test("can set course to private", async () => {
    await setCourseToPrivate("test", courseModelMock);
    expect(courseModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(courseModelInstanceMock.save).toHaveBeenCalledTimes(1);
    expect(courseModelInstanceMock.private).toEqual(true);
  });

  test("setting nonexistent course to private won't do anything", async () => {
    courseModelMock.findOne.mockResolvedValueOnce(null);
    await setCourseToPrivate("test", courseModelMock);
    expect(courseModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(courseModelInstanceMock.save).toHaveBeenCalledTimes(0);
  });

  test("can set course to public", async () => {
    courseModelInstanceMock.private = true;
    await setCourseToPublic("test", courseModelMock);
    expect(courseModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(courseModelInstanceMock.save).toHaveBeenCalledTimes(1);
    expect(courseModelInstanceMock.private).toEqual(false);
  });

  test("setting nonexistent course to public won't do anything", async () => {
    courseModelMock.findOne.mockResolvedValueOnce(null);
    await setCourseToPublic("test", courseModelMock);
    expect(courseModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(courseModelInstanceMock.save).toHaveBeenCalledTimes(0);
  });

  test("can lock course", async () => {
    await setCourseToLocked("test", courseModelMock);
    expect(courseModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(courseModelInstanceMock.save).toHaveBeenCalledTimes(1);
    expect(courseModelInstanceMock.locked).toEqual(true);
  });

  test("setting nonexistent course to locked won't do anything", async () => {
    courseModelMock.findOne.mockResolvedValueOnce(null);
    await setCourseToLocked("test", courseModelMock);
    expect(courseModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(courseModelInstanceMock.save).toHaveBeenCalledTimes(0);
  });

  test("can unlock course", async () => {
    courseModelInstanceMock.locked = true;
    await setCourseToUnlocked("test", courseModelMock);
    expect(courseModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(courseModelInstanceMock.save).toHaveBeenCalledTimes(1);
    expect(courseModelInstanceMock.locked).toEqual(false);
  });

  test("setting nonexistent course to unlocked won't do anything", async () => {
    courseModelMock.findOne.mockResolvedValueOnce(null);
    await setCourseToUnlocked("test", courseModelMock);
    expect(courseModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(courseModelInstanceMock.save).toHaveBeenCalledTimes(0);
  });

  test("can create course", async () => {
    courseModelMock.findOne.mockResolvedValueOnce(null);
    await createCourseToDatabase("TKT202", "Logarithms", "Logo", courseModelMock);
    expect(courseModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(courseModelMock.create).toHaveBeenCalledTimes(1);
  });

  test("creating won't save if course already exists", async () => {
    await createCourseToDatabase("TKT-test", "test course", "test", courseModelMock);
    expect(courseModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(courseModelMock.create).toHaveBeenCalledTimes(0);
  });

  test("can remove course", async () => {
    await removeCourseFromDb("test", courseModelMock);
    expect(courseModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(courseModelMock.destroy).toHaveBeenCalledTimes(1);
  });

  test("removing nonexistent course won't do anything", async () => {
    courseModelMock.findOne.mockResolvedValueOnce(null);
    await removeCourseFromDb("test", courseModelMock);
    expect(courseModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(courseModelMock.destroy).toHaveBeenCalledTimes(0);
  });

  test("can find course from db", async () => {
    await findCourseFromDb("test", courseModelMock);
    expect(courseModelMock.findOne).toHaveBeenCalledTimes(1);
  });

  test("can find course from db by ID", async () => {
    await findCourseFromDbById(1, courseModelMock);
    expect(courseModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(courseModelMock.findOne).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
    });
  });

  test("find courses from db private", async () => {
    await findCoursesFromDb("fullName", courseModelMock, false);
    const filter = {
      true: { private: true },
      false: { private: false },
      undefined: {},
    };
    expect(courseModelMock.findAll).toHaveBeenCalledTimes(1);
    expect(courseModelMock.findAll).toHaveBeenCalledWith({
      attributes: ["id", "code", "fullName", "name"],
      order: ["fullName"],
      where: filter[false],
      raw: true,
    });
  });

  test("find courses from db public", async () => {
    await findCoursesFromDb("fullName", courseModelMock, true);
    const filter = {
      true: { private: true },
      false: { private: false },
      undefined: {},
    };
    expect(courseModelMock.findAll).toHaveBeenCalledTimes(1);
    expect(courseModelMock.findAll).toHaveBeenCalledWith({
      attributes: ["id", "code", "fullName", "name"],
      order: ["fullName"],
      where: filter[true],
      raw: true,
    });
  });

  test("find course from db with full name", async () => {
    await findCourseFromDbWithFullName("test course", courseModelMock);
    expect(courseModelMock.findOne).toHaveBeenCalledTimes(1);
  });

  test("find course with coursecode", async () => {
    await findCourseNickNameFromDbWithCourseCode("TKT-test", courseModelMock);
    expect(courseModelMock.findOne).toHaveBeenCalledTimes(1);
  });

  test("find all courses", async () => {
    const result = await findAllCourseNames(courseModelMock);
    expect(courseModelMock.findAll).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(["test"]);
  });

});