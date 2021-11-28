const { setCourseToPrivate, setCourseToPublic, setCourseToLocked, setCourseToUnlocked, removeCourseFromDb, createCourseToDatabase, findCourseFromDb, findCourseFromDbById, findCoursesFromDb, findCourseFromDbWithFullName, findCourseNickNameFromDbWithCourseCode, findAllCourseNames } = require("../../../src/db/services/courseService");

const userModelInstanceMock = {
  id: 1,
  code: "TKT-test",
  fullname: "test course",
  name: "test",
  telegramId: null,
  private: false,
  locked: false,
  save: jest.fn(),
};

const userModelMock = {
  findOne: jest.fn().mockResolvedValue(userModelInstanceMock),
  destroy: jest.fn().mockResolvedValue(userModelInstanceMock),
  create: jest.fn().mockResolvedValue(userModelInstanceMock),
  findAll: jest.fn().mockResolvedValue([userModelInstanceMock]),
};


afterEach(() => {
  jest.clearAllMocks();
});

describe("courseService", () => {
  test("can set course to private", async () => {
    await setCourseToPrivate("test", userModelMock);
    expect(userModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(userModelInstanceMock.save).toHaveBeenCalledTimes(1);
    expect(userModelInstanceMock.private).toEqual(true);
  });

  test("can set course to public", async () => {
    userModelInstanceMock.private = true;
    await setCourseToPublic("test", userModelMock);
    expect(userModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(userModelInstanceMock.save).toHaveBeenCalledTimes(1);
    expect(userModelInstanceMock.private).toEqual(false);
  });

  test("can lock course", async () => {
    await setCourseToLocked("test", userModelMock);
    expect(userModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(userModelInstanceMock.save).toHaveBeenCalledTimes(1);
    expect(userModelInstanceMock.locked).toEqual(true);
  });

  test("can unlock course", async () => {
    userModelInstanceMock.locked = true;
    await setCourseToUnlocked("test", userModelMock);
    expect(userModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(userModelInstanceMock.save).toHaveBeenCalledTimes(1);
    expect(userModelInstanceMock.locked).toEqual(false);
  });

  test("can create course", async () => {
    userModelMock.findOne.mockResolvedValueOnce(null);
    await createCourseToDatabase("TKT202", "Logarithms", "Logo", userModelMock);
    expect(userModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(userModelMock.create).toHaveBeenCalledTimes(1);
  });

  test("can remove course", async () => {
    await removeCourseFromDb("test", userModelMock);
    expect(userModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(userModelMock.destroy).toHaveBeenCalledTimes(1);
  });

  test("can find course from db", async () => {
    await findCourseFromDb("test", userModelMock);
    expect(userModelMock.findOne).toHaveBeenCalledTimes(1);
  });

  test("can find course from db by ID", async () => {
    await findCourseFromDbById(1, userModelMock);
    expect(userModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(userModelMock.findOne).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
    });
  });

  test("find courses from db private", async () => {
    await findCoursesFromDb("fullName", userModelMock, false);
    const filter = {
      true: { private: true },
      false: { private: false },
      undefined: {},
    };
    expect(userModelMock.findAll).toHaveBeenCalledTimes(1);
    expect(userModelMock.findAll).toHaveBeenCalledWith({
      attributes: ["id", "code", "fullName", "name"],
      order: ["fullName"],
      where: filter[false],
      raw: true,
    });
  });

  test("find courses from db public", async () => {
    await findCoursesFromDb("fullName", userModelMock, true);
    const filter = {
      true: { private: true },
      false: { private: false },
      undefined: {},
    };
    expect(userModelMock.findAll).toHaveBeenCalledTimes(1);
    expect(userModelMock.findAll).toHaveBeenCalledWith({
      attributes: ["id", "code", "fullName", "name"],
      order: ["fullName"],
      where: filter[true],
      raw: true,
    });
  });

  test("find course from db with full name", async () => {
    await findCourseFromDbWithFullName("test course", userModelMock);
    expect(userModelMock.findOne).toHaveBeenCalledTimes(1);
  });

  test("find course with coursecode", async () => {
    await findCourseNickNameFromDbWithCourseCode("TKT-test", userModelMock);
    expect(userModelMock.findOne).toHaveBeenCalledTimes(1);
  });

  test("find all courses", async () => {
    const result = await findAllCourseNames(userModelMock);
    expect(userModelMock.findAll).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual(["test"]);
  });

});