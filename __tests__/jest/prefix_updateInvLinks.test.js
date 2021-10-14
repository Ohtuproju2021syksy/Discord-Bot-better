const { execute } = require("../../src/discordBot/commands/admin/updateinvlinks");
const { createCourseInvitationLink } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/services/service");

const { messageInCommandsChannel, teacher, student } = require("../mocks/mockMessages");
const courseString = "test";

afterEach(() => {
  jest.clearAllMocks();
});

describe("prefix updateinvlinks command", () => {
  test("if user does not have administrator permission do nothing", async () => {
    messageInCommandsChannel.member = student;
    await execute(messageInCommandsChannel);
    expect(createCourseInvitationLink).toHaveBeenCalledTimes(0);
  });

  test("if user has administrator permission update roles", async () => {
    messageInCommandsChannel.member = teacher;
    await execute(messageInCommandsChannel);
    expect(createCourseInvitationLink).toHaveBeenCalledTimes(1);
    expect(createCourseInvitationLink).toHaveBeenCalledWith(courseString);
  });
});