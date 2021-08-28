const { execute } = require("../../src/discordBot/commands/student/instructors");
const { sendEphemeral } = require("../../src/discordBot/commands/utils");
const { courseAdminRole } = require("../../config.json");

jest.mock("../../src/discordBot/commands/utils");

const {
  studentInteractionWithoutOptions,
  defaultTeacherInteraction,
  defaultStudentInteraction } = require("../mocks/mockInteraction");

const roleString = "test";

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash insctuctors command", () => {
  test("instructors command used outside course channels", async () => {
    const client = studentInteractionWithoutOptions.client;
    const response = "Provide course name as argument or use the command in course channel.";
    await execute(studentInteractionWithoutOptions, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, studentInteractionWithoutOptions, response);
  });

  test("instructors command used without args in course channels", async () => {
    const client = studentInteractionWithoutOptions.client;
    studentInteractionWithoutOptions.channel_id = 2;
    const response = `No instructors for ${roleString}`;
    await execute(studentInteractionWithoutOptions, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, studentInteractionWithoutOptions, response);
  });

  test("instructors command used without course admins", async () => {
    const client = defaultStudentInteraction.client;
    defaultStudentinteraction.options.getString("input").value = roleString;
    const response = `No instructors for ${roleString}`;
    await execute(defaultStudentInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultStudentInteraction, response);
  });

  test("instructors command used with course admins with args", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherinteraction.options.getString("input").value = roleString;
    client.guild.roles.create({ data: { name: `${roleString} ${courseAdminRole}`, members: [{ nickname: "teacher" }] } });
    const response = `Here are the instructors for ${roleString}: teacher`;
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
    client.guild.roles.init();
  });

  test("no course admins", async () => {
    const client = defaultTeacherInteraction.client;
    defaultTeacherinteraction.options.getString("input").value = roleString;
    client.guild.roles.create({ data: { name: `${roleString} ${courseAdminRole}`, members: [] } });
    const response = `No instructors for ${roleString}`;
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
    client.guild.roles.init();
  });

  test("instructors command used with in course channel without args", async () => {
    const client = defaultStudentInteraction.client;
    defaultStudentinteraction.options.getString("input").value = roleString;
    client.guild.roles.create({ data: { name: `${roleString} ${courseAdminRole}`, members: [{ nickname: "teacher" }] } });
    const response = "Here are the instructors for test: teacher";
    await execute(defaultStudentInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultStudentInteraction, response);
    client.guild.roles.init();
  });
});