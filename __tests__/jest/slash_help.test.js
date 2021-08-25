const { execute } = require("../../src/discordBot/commands/student/help");

const {
  adminData,
  defaultAdminInteraction,
  defaultTeacherInteraction,
  defaultStudentInteraction,
  teacherInteractionHelp,
  teacherData,
  studentInteractionWithoutOptions,
  studentData,
  teacherJoinData } = require("../mocks/mockInteraction");

const { sendEphemeral } = require("../../src/discordBot/commands/utils");

jest.mock("../../src/discordBot/commands/utils");
jest.mock("../../src/discordBot/services/service");
jest.mock("discord-slash-commands-client");


afterEach(() => {
  jest.clearAllMocks();
});

describe("slash help command", () => {
  test("admin can see all commands", async () => {
    const client = defaultAdminInteraction.client;
    await execute(defaultAdminInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultAdminInteraction, adminData.join("\n"));
  });

  test("slash help with teacher role should see all non-admin commands", async () => {
    const client = teacherInteractionHelp.client;
    await execute(teacherInteractionHelp, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, teacherInteractionHelp, teacherData.join("\n"));
  });

  test("slash help with student role cannot see teacher commands", async () => {
    const client = studentInteractionWithoutOptions.client;
    await execute(studentInteractionWithoutOptions, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, studentInteractionWithoutOptions, studentData.join("\n"));
  });

  test("slash help with invalid arg should give error", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.data.options[0].value = "invalidCommand";
    const response = "that's not a valid command!";
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
  });

  test("slash help with valid arg should give correct command info", async () => {
    const client = defaultStudentInteraction.client;
    defaultStudentInteraction.data.options = [{ value: "join", command: {
      name: "join",
      description: "Join a course, e.g., `/join ohpe`",
      usage: "/join [course name]",
    },
    }];
    await execute(defaultStudentInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultStudentInteraction, teacherJoinData.join(" \n"));
  });
});