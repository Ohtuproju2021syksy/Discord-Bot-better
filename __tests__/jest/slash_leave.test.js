const { execute } = require("../../src/discordBot/slash_commands/student/leave");
const { sendEphemeral } = require("../../src/discordBot/slash_commands/utils");
const { updateGuide } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/slash_commands/utils");
jest.mock("../../src/discordBot/services/service");
jest.mock("discord-slash-commands-client");

const { defaultTeacherInteraction } = require("../temp/mockInteraction");
const roleString = "test";
defaultTeacherInteraction.data.options = [{ value: roleString }];

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash leave command", () => {
  test("invalid course name responds with correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, `Invalid course name: ${roleString}`);
  });

  test("if user does not have course role responds with correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    client.guild.roles.create({ data: { name: roleString } });
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, `You are not on a ${roleString} course.`);
  });

  test("leave with proper course name and roles return correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    const member = client.guild.members.cache.get(defaultTeacherInteraction.member.user.id);
    const memberRolesLengthAtStart = member.roles.cache.length;
    await member.roles.add("test");
    await execute(defaultTeacherInteraction, client);
    expect(member.roles.remove).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, `You have been removed from the ${roleString} course.`);
    expect(member.roles.cache.length).toBe(memberRolesLengthAtStart);
    expect(member.fetch).toHaveBeenCalledTimes(1);
    expect(updateGuide).toHaveBeenCalledTimes(1);
  });
});