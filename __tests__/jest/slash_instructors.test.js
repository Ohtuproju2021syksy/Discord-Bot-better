const { execute } = require("../../src/discordBot/slash_commands/student/instructors");
const { sendEphemeral } = require("../../src/discordBot/slash_commands/utils");

jest.mock("../../src/discordBot/slash_commands/utils");

const { intInsWithoutArgs,
  intInsWithValidArgs,
  intInsWithInvalidArgs,
  intInsWithoutArgsInCourseChannelWithAdmins } = require("../temp/mockInteraction");

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash insctuctors command", () => {
  test("instructors command used outside course channels", async () => {
    const client = intInsWithoutArgs.client;
    await execute(intInsWithoutArgs, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, intInsWithoutArgs, "Provide course name as argument or use the command in course channel.");
  });

  test("instructors command used without course admins", async () => {
    const roleString = intInsWithInvalidArgs.data.options[0].value;
    const client = intInsWithInvalidArgs.client;
    await execute(intInsWithInvalidArgs, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, intInsWithInvalidArgs, `No instructors for ${roleString}`);
  });

  test("instructors command used with course admins withargs", async () => {
    const roleString = intInsWithValidArgs.data.options[0].value;
    const client = intInsWithValidArgs.client;
    client.guild.roles.cache.push({ name: `${roleString} admin`, members: [{ nickname: "teacher" }] });
    await execute(intInsWithValidArgs, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, intInsWithValidArgs, `Here are the instructors for ${roleString}: teacher`);
    client.guild.roles.cache = [];
  });

  test("no course admins", async () => {
    const roleString = intInsWithValidArgs.data.options[0].value;
    const client = intInsWithValidArgs.client;
    client.guild.roles.cache.push({ name: `${roleString} admin`, members: [] });
    await execute(intInsWithValidArgs, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, intInsWithValidArgs, `No instructors for ${roleString}`);
    client.guild.roles.cache = [];
  });

  test("instructors command used with course admins in course channel without args", async () => {
    const client = intInsWithoutArgsInCourseChannelWithAdmins.client;
    client.guild.roles.cache.push({ name: "test admin", members: [{ nickname: "teacher" }] });
    await execute(intInsWithoutArgsInCourseChannelWithAdmins, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, intInsWithoutArgsInCourseChannelWithAdmins, "Here are the instructors for test: teacher");
    client.guild.roles.cache = [];
  });
});