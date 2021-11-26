const { setCourseToPrivate } = require("../../../src/db/services/courseService");

const userModelInstanceMock = {
  private: "false",
  save: jest.fn() };

const userModelMock = { findOne:
  jest.fn().mockResolvedValueOnce(userModelInstanceMock) };

describe("Service", () => {
  test("can set course to private", async () => {
    await setCourseToPrivate("test", userModelMock);
    expect(userModelMock.findOne).toHaveBeenCalledTimes(1);
    expect(userModelInstanceMock.save).toHaveBeenCalledTimes(1);
    expect(userModelInstanceMock.private).toEqual(true);
  });
});