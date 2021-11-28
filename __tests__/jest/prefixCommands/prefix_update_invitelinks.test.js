const { execute } = require("../../../src/discordBot/commands/admin/update_invitelinks");
const { getCourseNameFromCategory, updateInviteLinks } = require("../../../src/discordBot/services/service");

jest.mock("../../../src/discordBot/services/service");

const { messageInCommandsChannel, teacher, student } = require("../../mocks/mockMessages");
const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi;

getCourseNameFromCategory
  .mockImplementation((courseName) => courseName.name.replace(emojiRegex, "").trim());

afterEach(() => {
  jest.clearAllMocks();
});

describe("prefix update_invitelinks command", () => {
  test("if user does not have administrator permission do nothing", async () => {
    messageInCommandsChannel.member = student;
    await execute(messageInCommandsChannel);
    expect(updateInviteLinks).toHaveBeenCalledTimes(0);
  });

  test("if user has administrator permission update roles", async () => {
    messageInCommandsChannel.member = teacher;
    await execute(messageInCommandsChannel);
    expect(updateInviteLinks).toHaveBeenCalledTimes(1);
    expect(updateInviteLinks).toHaveBeenCalledWith(messageInCommandsChannel.guild);
  });
});