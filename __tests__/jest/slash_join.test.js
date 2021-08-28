const { execute } = require("../../src/discordBot/commands/student/join");
const { sendEphemeral } = require("../../src/discordBot/commands/utils");
const { updateGuide } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/commands/utils");
jest.mock("../../src/discordBot/services/service");
jest.mock("discord-slash-commands-client");

const { defaultTeacherInteraction } = require("../mocks/mockInteraction");

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash join command", () => {
  test("join to valid course adds role and responds with correct epheremal", async () => {
    const roleString = "tester";
    defaultTeacherinteraction.options.getString("input").value = roleString;
    defaultTeacherinteraction.options.getString("input").command = "join";
    const client = defaultTeacherInteraction.client;
    client.guild.roles.create({ data: { name: roleString } });
    const member = client.guild.members.cache.get(defaultTeacherInteraction.member.user.id);
    await execute(defaultTeacherInteraction, client);
    expect(member.roles.add).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, `You have been added to a ${roleString} course.`);
    expect(updateGuide).toHaveBeenCalledTimes(1);
  });

  test("join to course twice, role added only ones and second time responds with correct ephemeral", async () => {
    const roleString = "tester";
    const client = defaultTeacherInteraction.client;
    const member = client.guild.members.cache.get(defaultTeacherInteraction.member.user.id);
    member.roles.cache.push({ name: "tester" });
    await execute(defaultTeacherInteraction, client);
    expect(member.roles.add).toHaveBeenCalledTimes(0);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, `You are already on a ${roleString} course.`);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });

  test("trying to join invalid course responds with correct ephemeral", async () => {
    const roleString = "testing";
    defaultTeacherinteraction.options.getString("input").value = roleString;
    const response = `Invalid course name: ${roleString}`;
    const client = defaultTeacherInteraction.client;
    const member = client.guild.members.cache.get(defaultTeacherInteraction.member.user.id);
    await execute(defaultTeacherInteraction, client);
    expect(member.roles.add).toHaveBeenCalledTimes(0);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });
});