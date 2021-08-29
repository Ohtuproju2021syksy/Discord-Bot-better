const { execute } = require("../../src/discordBot/commands/student/instructors");
const { sendEphemeral, sendErrorEphemeral } = require("../../src/discordBot/services/message");
const { courseAdminRole } = require("../../config.json");

jest.mock("../../src/discordBot/services/message");

const {
  studentInteractionWithoutOptions,
  defaultTeacherInteraction,
  defaultStudentInteraction } = require("../mocks/mockInteraction");

const roleString = "test";
defaultTeacherInteraction.options = { getString: jest.fn(() => roleString) };
studentInteractionWithoutOptions.options = { getString: jest.fn(() => false) };
defaultStudentInteraction.options = { getString: jest
  .fn(() => false)
  .mockImplementationOnce(() => roleString)
  .mockImplementationOnce(() => roleString),
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash insctuctors command", () => {
  test("instructors command used outside course channels", async () => {
    const client = studentInteractionWithoutOptions.client;
    const response = "Provide course name as argument or use the command in course channel.";
    await execute(studentInteractionWithoutOptions, client);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(studentInteractionWithoutOptions, response);
  });

  test("instructors command used without args in course channels", async () => {
    const client = studentInteractionWithoutOptions.client;
    studentInteractionWithoutOptions.channelId = 2;
    const response = `No instructors for ${roleString}`;
    await execute(studentInteractionWithoutOptions, client);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(studentInteractionWithoutOptions, response);
  });

  test("instructors command used without course admins", async () => {
    const client = defaultStudentInteraction.client;
    const response = `No instructors for ${roleString}`;
    await execute(defaultStudentInteraction, client);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, response);
  });

  test("instructors command used with course admins with args", async () => {
    const client = defaultTeacherInteraction.client;
    client.guild.roles.create({ name: `${roleString} ${courseAdminRole}`, members: [{ displayName: "teacher" }] });
    const response = `Here are the instructors for ${roleString}: teacher`;
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
    client.guild.roles.init();
  });

  test("no course admins", async () => {
    const client = defaultTeacherInteraction.client;
    client.guild.roles.create({ name: `${roleString} ${courseAdminRole}`, members: [] });
    const response = `No instructors for ${roleString}`;
    await execute(defaultTeacherInteraction, client);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
    client.guild.roles.init();
  });

  test("instructors command used with in course channel without args", async () => {
    const client = defaultStudentInteraction.client;
    client.guild.roles.create({ name: `${roleString} ${courseAdminRole}`, members: [{ displayName: "teacher" }] });
    const response = "Here are the instructors for test: teacher";
    await execute(defaultStudentInteraction, client);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(0);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, response);
    client.guild.roles.init();
  });
});