const { execute } = require("../../src/discordBot/commands/student/join");
const { sendEphemeral } = require("../../src/discordBot/commands/utils");
const { updateGuide } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/commands/utils");
jest.mock("../../src/discordBot/services/service");
jest.mock("discord-slash-commands-client");

const { interactionJoin } = require("../mocks/mockInteraction");

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash join command", () => {
  test("join to valid course adds role and responds with correct epheremal", async () => {
    const roleString = "tester";
    const client = interactionJoin.client;
    client.guild.roles.cache.push({ name: roleString });
    const member = client.guild.members.cache.get(interactionJoin.member.user.id);
    await execute(interactionJoin, client);
    expect(member.roles.add).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, interactionJoin, `You have been added to a ${roleString} course.`);
    expect(updateGuide).toHaveBeenCalledTimes(1);
  });

  test("join to course twice, role added only ones and second time responds with correct ephemeral", async () => {
    const roleString = "tester";
    const client = interactionJoin.client;
    const member = client.guild.members.cache.get(interactionJoin.member.user.id);
    member.roles.cache.push({ name: "tester" });
    await execute(interactionJoin, client);
    expect(member.roles.add).toHaveBeenCalledTimes(0);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, interactionJoin, `You are already on a ${roleString} course.`);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });
});