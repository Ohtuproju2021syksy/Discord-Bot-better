const { execute } = require("../../src/discordBot/commands/faculty/status");
const { sendEphemeral } = require("../../src/discordBot/commands/utils");
const {
  getRoleFromCategory,
  createCourseInvitationLink,
  trimCourseName,
  findCourseFromDb } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/commands/utils");
jest.mock("../../src/discordBot/services/service");

findCourseFromDb.mockImplementationOnce(() => {
  return {
    name: "test",
    fullname: "test course",
    code: "101",
  };
});

createCourseInvitationLink.mockImplementationOnce(() => "www.mockparadise.org");

const { defaultTeacherInteraction } = require("../mocks/mockInteraction");

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash status command", () => {
  test("used outside course channels", async () => {
    const client = defaultTeacherInteraction.client;
    const response = "This is not a course category, can not execute the command";
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
  });

  test("used outside course channels", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channel_id = 2;
    await execute(defaultTeacherInteraction, client);
    expect(trimCourseName).toHaveBeenCalledTimes(1);
    expect(findCourseFromDb).toHaveBeenCalledTimes(1);
    expect(getRoleFromCategory).toHaveBeenCalledTimes(1);
    expect(createCourseInvitationLink).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
  });
});
