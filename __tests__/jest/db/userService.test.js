const {
  findUserByDiscordId,
  createUserToDatabase,
  removeUserFromDb,
  saveFacultyRoleToDb,
  findUserByDbId } = require("../../../src/db/services/userService");

const userModelInstanceMock = {
  id: 1,
  name: "JonDoe",
  admin: false,
  faculty: false,
  discordId: 10,
  update: jest.fn(),
};

const userModelMock = {
  findOne: jest.fn().mockResolvedValue(userModelInstanceMock),
  create: jest.fn().mockResolvedValue(userModelInstanceMock),
  destroy: jest.fn().mockResolvedValue(userModelInstanceMock),
  update: jest.fn().mockResolvedValue(userModelInstanceMock),
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("userService", () => {

  test("find course member with discord id", async () => {
    await findUserByDiscordId(10, userModelMock);
    expect(userModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(userModelMock.findOne).toHaveBeenCalledWith({
      where:
        { discordId: 10 },
    });
  });

  test("find user with id", async () => {
    await findUserByDbId(1, userModelMock);
    expect(userModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(userModelMock.findOne).toHaveBeenCalledWith({
      where:
        { id: 1 },
    });
  });

  test("create user to database", async () => {
    userModelMock.findOne.mockResolvedValueOnce(null);
    await createUserToDatabase(12, "JaneDoe", userModelMock);
    expect(userModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(userModelMock.findOne).toHaveBeenCalledWith({
      where:
        { discordId: 12 },
    });
    expect(userModelMock.create).toHaveBeenCalledTimes(1);
    expect(userModelMock.create).toHaveBeenCalledWith({
      name: "JaneDoe",
      discordId: 12,
    });
  });

  test("create user to database won't save if already exists", async () => {
    const result = await createUserToDatabase(10, "JonDoe", userModelMock);
    expect(result).toBe(userModelInstanceMock);
    expect(userModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(userModelMock.findOne).toHaveBeenCalledWith({
      where:
        { discordId: 10 },
    });
    expect(userModelMock.create).toHaveBeenCalledTimes(0);

  });

  test("remove user from database", async () => {
    await removeUserFromDb(10, userModelMock);
    expect(userModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(userModelMock.findOne).toHaveBeenCalledWith({
      where:
        { discordId: 10 },
    });
    expect(userModelMock.destroy).toHaveBeenCalledTimes(1);
    expect(userModelMock.destroy).toHaveBeenCalledWith({
      where:
        { id: 1 },
    });
  });

  test("remove user from database won't remove if user doesn't exist", async () => {
    userModelMock.findOne.mockResolvedValueOnce(null);
    await removeUserFromDb(10, userModelMock);
    expect(userModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(userModelMock.findOne).toHaveBeenCalledWith({
      where:
        { discordId: 10 },
    });
    expect(userModelMock.destroy).toHaveBeenCalledTimes(0);
  });

  test("add faculty role to database", async () => {
    await saveFacultyRoleToDb(10, userModelMock);
    expect(userModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(userModelMock.findOne).toHaveBeenCalledWith({
      where:
        { discordId: 10 },
    });
    expect(userModelInstanceMock.update).toHaveBeenCalledTimes(1);
    expect(userModelInstanceMock.update).toHaveBeenCalledWith({
      faculty: true,
    });
  });

  test("add faculty role to database won't save if user doesn't exist", async () => {
    userModelMock.findOne.mockResolvedValueOnce(null);
    await saveFacultyRoleToDb(10, userModelMock);
    expect(userModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(userModelMock.findOne).toHaveBeenCalledWith({
      where:
        { discordId: 10 },
    });
    expect(userModelInstanceMock.update).toHaveBeenCalledTimes(0);
  });

});