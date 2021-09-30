const { execute } = require("../../src/discordBot/commands/student/help");

const {
  adminData,
  defaultAdminInteraction,
  defaultTeacherInteraction,
  defaultStudentInteraction,
  teacherData,
  studentInteractionWithoutOptions,
  studentData,
  studentJoinData } = require("../mocks/mockInteraction");

defaultAdminInteraction.options = { getString: jest.fn(() => false) };
defaultTeacherInteraction.options = { getString: jest.fn(() => false) };
studentInteractionWithoutOptions.options = { getString: jest.fn(() => false) };
defaultStudentInteraction.options = { getString: jest
  .fn(() => "join")
  .mockImplementationOnce(() => "invalid")
  .mockImplementationOnce(() => "invalid"),
};

const { sendErrorEphemeral, sendEphemeral } = require("../../src/discordBot/services/message");

jest.mock("../../src/discordBot/services/message");
jest.mock("../../src/discordBot/services/service");

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash help command", () => {
  test("admin can see all commands", async () => {
    const client = defaultAdminInteraction.client;
    await execute(defaultAdminInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultAdminInteraction, adminData.join("\n"));
  });

  test("slash help with invalid arg should give error", async () => {
    const client = defaultStudentInteraction.client;
    const response = "that's not a valid command!";
    await execute(defaultStudentInteraction, client);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, response);
  });

  test("slash help with teacher role should see all non-admin commands", async () => {
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, teacherData.join("\n"));
  });

  test("slash help with student role cannot see teacher commands", async () => {
    const client = studentInteractionWithoutOptions.client;
    await execute(studentInteractionWithoutOptions, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(studentInteractionWithoutOptions, studentData.join("\n"));
  });

  test("slash help with valid arg should give correct command info", async () => {
    const client = defaultStudentInteraction.client;
    await execute(defaultStudentInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, studentJoinData.join(" \n"));
  });
});