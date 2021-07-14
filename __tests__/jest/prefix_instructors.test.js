const { execute } = require("../../src/discordBot/commands/student/instructors");

const { instructorsMessageOutsideCourseChannels,
  instructorsMessageOutsideCourseChannelsWithoutRoles,
  instructorsMessageOutsideCourseChannelsWithRoles } = require("../temp/mockMessages");

afterEach(() => {
  jest.clearAllMocks();
});

describe("insctuctors command", () => {
  test("instructors command used outside course channels", async () => {
    const client = instructorsMessageOutsideCourseChannels.client;
    try {
      await execute(instructorsMessageOutsideCourseChannels, client);
    }
    catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("instructors command used without course admins", async () => {
    const client = instructorsMessageOutsideCourseChannelsWithoutRoles.client;
    await execute(instructorsMessageOutsideCourseChannelsWithoutRoles, client);
    expect(instructorsMessageOutsideCourseChannelsWithoutRoles.reply).toHaveBeenCalledTimes(1);
    expect(instructorsMessageOutsideCourseChannelsWithoutRoles.reply).toHaveBeenCalledWith("It seems as if there are no instructors for this course yet. They need to be added manually.");
  });

  test("instructors command used with course admins", async () => {
    const client = instructorsMessageOutsideCourseChannelsWithRoles;
    await execute(instructorsMessageOutsideCourseChannelsWithRoles, client);
    expect(instructorsMessageOutsideCourseChannelsWithRoles.reply).toHaveBeenCalledTimes(1);
    expect(instructorsMessageOutsideCourseChannelsWithRoles.reply).toHaveBeenCalledWith("Here are the instructors for test: teacher");
  });
});