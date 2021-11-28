const { execute } = require("../../../src/discordBot/commands/faculty/status");
const { sendEphemeral, editErrorEphemeral, editEphemeralForStatus } = require("../../../src/discordBot/services/message");
const {
  getCourseNameFromCategory,
  createCourseInvitationLink,
  listCourseInstructors,
  isCourseCategory } = require("../../../src/discordBot/services/service");
const { findCourseFromDb } = require("../../../src/db/services/courseService");
const { findChannelsByCourse } = require("../../../src/db/services/channelService");
const { findAllCourseMembers } = require("../../../src/db/services/courseMemberService");

const models = require("../../mocks/mockModels");

jest.mock("../../../src/discordBot/services/message");
jest.mock("../../../src/discordBot/services/service");
jest.mock("../../../src/db/services/courseService");
jest.mock("../../../src/db/services/channelService");
jest.mock("../../../src/db/services/courseMemberService");


const course = { name: "test", fullName: "test course", code: "101", private: false };
const channel = { courseId: 1, name: "test_channel", topic: "test", bridged: true };
const url = "mockUrl";
const initialResponse = "Fetching status...";

listCourseInstructors.mockImplementation(() => "");
findCourseFromDb.mockImplementation(() => course);
findChannelsByCourse.mockImplementation(() => [channel]);

createCourseInvitationLink.mockImplementation(() => url);

const courseMembersInstanceMock = { length: undefined };
findAllCourseMembers.mockImplementation(() => courseMembersInstanceMock);

const { defaultTeacherInteraction } = require("../../mocks/mockInteraction");

const createResponse = () => {
  return `
Course: ${course.name}
Fullname: ${course.fullName}
Code: ${course.code}
Hidden: ${course.private}
Invitation Link: ${url}
Bridge blocked on channels: No blocked channels

Instructors: No instructors for undefined
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
    isCourseCategory.mockImplementationOnce(() => (true));
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 2;
    const response = createResponse();
    await execute(defaultTeacherInteraction, client, models);
    expect(getCourseNameFromCategory).toHaveBeenCalledTimes(1);
    expect(findCourseFromDb).toHaveBeenCalledTimes(1);
    expect(createCourseInvitationLink).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editEphemeralForStatus).toHaveBeenCalledTimes(1);
    expect(editEphemeralForStatus).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });
});
