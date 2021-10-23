const { execute } = require("../../../src/discordBot/commands/admin/update_invitelinks");
const { createCourseInvitationLink, trimCourseName } = require("../../../src/discordBot/services/service");

jest.mock("../../../src/discordBot/services/service");

const { messageInCommandsChannel, teacher, student } = require("../../mocks/mockMessages");
const courseString = "test";
const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;

trimCourseName
  .mockImplementation((courseName) => courseName.name.replace(emojiRegex, "").trim());

afterEach(() => {
  jest.clearAllMocks();
});

describe("prefix update_invitelinks command", () => {
  test("if user does not have administrator permission do nothing", async () => {
    messageInCommandsChannel.member = student;
    await execute(messageInCommandsChannel);
    expect(createCourseInvitationLink).toHaveBeenCalledTimes(0);
  });

  test("if user has administrator permission update roles", async () => {
    messageInCommandsChannel.member = teacher;
    await execute(messageInCommandsChannel);
    expect(createCourseInvitationLink).toHaveBeenCalledTimes(1);
    expect(trimCourseName).toHaveBeenCalledTimes(1);
    expect(createCourseInvitationLink).toHaveBeenCalledWith(courseString);
  });
});