const { execute } = require("../../src/discordBot/commands/faculty/status");
const { sendEphemeral } = require("../../src/discordBot/commands/utils");
const {
  getRoleFromCategory,
  createCourseInvitationLink,
  trimCourseName,
  findCourseFromDb } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/commands/utils");
jest.mock("../../src/discordBot/services/service");

const course = { name: "test", fullName: "test course", code: "101", private: false };
const url = "mockUrl";

findCourseFromDb.mockImplementation(() => course);

createCourseInvitationLink.mockImplementation(() => url);

const { defaultTeacherInteraction } = require("../mocks/mockInteraction");

const createResponse = () => {
  return `
Course: ${course.name}
Fullname: ${course.fullName}
Code: ${course.code}
Hidden: ${course.private}
Invitation Link: ${url}

Instructors: No instructors
Members: undefined
  `;
};

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

  test("used in course channels", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channel_id = 2;
    const response = createResponse();
    await execute(defaultTeacherInteraction, client);
    expect(trimCourseName).toHaveBeenCalledTimes(1);
    expect(findCourseFromDb).toHaveBeenCalledTimes(1);
    expect(getRoleFromCategory).toHaveBeenCalledTimes(1);
    expect(createCourseInvitationLink).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
  });
});
