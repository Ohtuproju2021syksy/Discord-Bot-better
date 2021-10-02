const { execute } = require("../../src/discordBot/commands/faculty/status");
const { sendEphemeral, editErrorEphemeral, editEphemeral } = require("../../src/discordBot/services/message");
const {
  getRoleFromCategory,
  createCourseInvitationLink,
  trimCourseName,
  findCourseFromDb } = require("../../src/discordBot/services/service");
const models = require("../../src/db/dbInit");

jest.mock("../../src/discordBot/services/message");
jest.mock("../../src/discordBot/services/service");
jest.mock("../../src/db/dbInit");


const course = { name: "test", fullName: "test course", code: "101", private: false };
const url = "mockUrl";
const initialResponse = "Fetching status...";

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
    const response = "This is not a course category, can not execute the command!";
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("used in course channels", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 2;
    const response = createResponse();
    await execute(defaultTeacherInteraction, client, models);
    expect(trimCourseName).toHaveBeenCalledTimes(1);
    expect(findCourseFromDb).toHaveBeenCalledTimes(1);
    expect(getRoleFromCategory).toHaveBeenCalledTimes(1);
    expect(createCourseInvitationLink).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });
});
