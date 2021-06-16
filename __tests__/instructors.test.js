jest.mock("../src/service");
jest.mock("../src/dbInit");

const { client } = require("../src/index.js");
const { execute } = require("../src/events/message");
const { instructorsMessageOutsideCourseChannels,
  instructorsMessageOutsideCourseChannelsWithoutRoles,
  instructorsMessageOutsideCourseChannelsWithRoles } = require("./mocks.js");

afterEach(() => {
  jest.clearAllMocks();
});

describe("insctuctors command", () => {
  test("instructors command used outside course channels", async () => {
    try {
      await execute(instructorsMessageOutsideCourseChannels, client);
    }
    catch(err) {
      expect(err).toBeDefined();
    }
  });

  test("instructors command used without course admins", async () => {
    await execute(instructorsMessageOutsideCourseChannelsWithoutRoles, client);
    expect(instructorsMessageOutsideCourseChannelsWithoutRoles.reply).toHaveBeenCalledTimes(1);
    expect(instructorsMessageOutsideCourseChannelsWithoutRoles.reply).toHaveBeenCalledWith("It seems as if there are no instructors for this course yet. They need to be added manually.");
  });

  test("instructors command used with course admins", async () => {
    await execute(instructorsMessageOutsideCourseChannelsWithRoles, client);
    expect(instructorsMessageOutsideCourseChannelsWithRoles.reply).toHaveBeenCalledTimes(1);
    expect(instructorsMessageOutsideCourseChannelsWithRoles.reply).toHaveBeenCalledWith("Here are the instructors for test: teacher");
  });
});