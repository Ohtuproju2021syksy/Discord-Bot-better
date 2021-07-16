const { execute } = require("../../src/discordBot/slash_commands/student/join");
const { sendEphemeral } = require("../../src/discordBot/slash_commands/utils");
const { updateGuide } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/slash_commands/utils");
jest.mock("../../src/discordBot/services/service");
jest.mock("discord-slash-commands-client");

const { interactionJoin } = require("../temp/mockInteraction");

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash join command", () => {
  test("join to valid course adds role and responds with correct epheremal", async () => {
    const roleString = "test";
    const client = interactionJoin.client;
    client.guild.roles.cache.push({ name: roleString });
    const member = client.guild.members.cache.get(interactionJoin.member.user.id);
    await execute(interactionJoin, client);
    expect(member.roles.add).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, interactionJoin, `You have been added to a ${roleString} course.`);
    expect(updateGuide).toHaveBeenCalledTimes(1);
    expect(member.roles.cache.length).toBe(1);
  });

  test("join to course twice, role added only ones and second time responds with correct ephemeral", async () => {
    const roleString = "test";
    const client = interactionJoin.client;
    client.guild.roles.cache.push({ name: roleString });
    const member = client.guild.members.cache.get(interactionJoin.member.user.id);
    member.roles.cache.push({ name: "test" });
    await execute(interactionJoin, client);
    expect(member.roles.add).toHaveBeenCalledTimes(0);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, interactionJoin, `You are already on a ${roleString} course.`);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });
});