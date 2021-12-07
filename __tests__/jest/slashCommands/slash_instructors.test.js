const { execute } = require("../../../src/discordBot/commands/student/instructors");
const { sendEphemeral, editErrorEphemeral } = require("../../../src/discordBot/services/message");
const { courseAdminRole } = require("../../../config.json");

jest.mock("../../../src/discordBot/services/message");

const {
  studentInteractionWithoutOptions,
  defaultStudentInteraction } = require("../../mocks/mockInteraction");

const roleString = "test";
const initialResponse = "Fetching instructors...";

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash instructors command", () => {
  test("instructors command used outside course channels", async () => {
    const client = studentInteractionWithoutOptions.client;
    const response = "Use the command in a course channel.";
    await execute(studentInteractionWithoutOptions, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(studentInteractionWithoutOptions, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(studentInteractionWithoutOptions, response);
  });

  test("instructors command used in course channels", async () => {
    const client = studentInteractionWithoutOptions.client;
    studentInteractionWithoutOptions.channelId = 2;
    client.guild.roles.create({ id: 5, name: `${roleString} ${courseAdminRole}`, members: [{ displayName: "teacher", user: { id: 1 } }] });
    client.guild.roles.create({ id: 1, name: "faculty", members: [{ displayName: "teacher", user: { id: 1 } }] });
    const response = `No instructors for ${roleString}`;
    await execute(studentInteractionWithoutOptions, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(studentInteractionWithoutOptions, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(studentInteractionWithoutOptions, response);
  });

  test("instructors command used without course admins", async () => {
    const client = defaultStudentInteraction.client;
    client.guild.roles.create({ id: 5, name: `${roleString} ${courseAdminRole}`, members: [{ displayName: "teacher", user: { id: 1 } }] });
    client.guild.roles.create({ id: 1, name: "faculty", members: [{ displayName: "teacher", user: { id: 1 } }] });
    const response = `No instructors for ${roleString}`;
    await execute(defaultStudentInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, response);
  });

});