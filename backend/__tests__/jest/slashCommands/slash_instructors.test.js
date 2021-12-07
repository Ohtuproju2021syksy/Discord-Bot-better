const { execute } = require("../../../src/discordBot/commands/student/instructors");
const { sendEphemeral, editEphemeral, editErrorEphemeral } = require("../../../src/discordBot/services/message");
const { courseAdminRole } = require("../../../config.json");

jest.mock("../../../src/discordBot/services/message");

const {
  studentInteractionWithoutOptions,
  defaultStudentInteraction } = require("../../mocks/mockInteraction");

const roleString = "test";
const role2String = "test2";
const initialResponse = "Fetching instructors...";
studentInteractionWithoutOptions.options = { getString: jest.fn(() => false) };
defaultStudentInteraction.options = {
  getString: jest
    .fn(() => false)
    .mockImplementation(() => role2String)
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
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(studentInteractionWithoutOptions, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(studentInteractionWithoutOptions, response);
  });

  test("instructors command used without args in course channels", async () => {
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

  test("instructors command used with course admins with args", async () => {
    const client = defaultStudentInteraction.client;
    client.guild.roles.create({ id: 4, name: `${role2String} ${courseAdminRole}`, members: [{ displayName: "teacher", user: { id: 1 } }] });
    client.guild.roles.create({ id: 1, name: "faculty", members: [{ displayName: "teacher", user: { id: 1 } }] });
    const response = `Here are the instructors for ${role2String}: <@1>`;
    await execute(defaultStudentInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, initialResponse);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, response);
    client.guild.roles.init();
  });

  test("no course admins", async () => {
    const client = defaultStudentInteraction.client;
    client.guild.roles.create({ id: 6, name: `${role2String} ${courseAdminRole}`, members: [{ displayName: "teacher", user: { id: 1 } }] });
    client.guild.roles.create({ id: 1, name: "faculty", members: [{ displayName: "teacher", user: { id: 1 } }] });
    const response = `No instructors for ${role2String}`;
    await execute(defaultStudentInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, response);
    client.guild.roles.init();
  });

  test("instructors command used with in course channel without args", async () => {
    const client = defaultStudentInteraction.client;
    client.guild.roles.create({ id: 4, name: `${role2String} ${courseAdminRole}`, members: [{ displayName: "teacher", user: { id: 1 } }] });
    client.guild.roles.create({ id: 1, name: "faculty", members: [{ displayName: "teacher", user: { id: 1 } }] });
    const response = `Here are the instructors for ${role2String}: <@1>`;
    await execute(defaultStudentInteraction, client);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(0);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, initialResponse);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, response);
    client.guild.roles.init();
  });
});