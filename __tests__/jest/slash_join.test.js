const { execute } = require("../../src/discordBot/commands/student/join");
const { sendErrorEphemeral, sendEphemeral } = require("../../src/discordBot/services/message");
const { updateGuide } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/services/message");
jest.mock("../../src/discordBot/services/service");

const { defaultTeacherInteraction, defaultStudentInteraction } = require("../mocks/mockInteraction");
const roleString = "tester";
defaultTeacherInteraction.options = { getString: jest.fn(() => roleString) };
defaultStudentInteraction.options = { getString: jest.fn(() => "invalid") };

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash join command", () => {
  test("join to valid course adds role and responds with correct epheremal", async () => {
    const client = defaultTeacherInteraction.client;
    client.guild.roles.create({ name: roleString });
    const member = client.guild.members.cache.get(defaultTeacherInteraction.member.user.id);
    await execute(defaultTeacherInteraction, client);
    expect(member.roles.add).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, `You have been added to a ${roleString} course.`);
    expect(updateGuide).toHaveBeenCalledTimes(1);
  });

  test("join to course twice, role added only ones and second time responds with correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    const member = client.guild.members.cache.get(defaultTeacherInteraction.member.user.id);
    member.roles.cache.push({ name: "tester" });
    await execute(defaultTeacherInteraction, client);
    expect(member.roles.add).toHaveBeenCalledTimes(0);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, `You are already on a ${roleString} course.`);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });

  test("trying to join invalid course responds with correct ephemeral", async () => {
    const response = "Invalid course name: invalid";
    const client = defaultStudentInteraction.client;
    const member = client.guild.members.cache.get(defaultStudentInteraction.member.user.id);
    await execute(defaultStudentInteraction, client);
    expect(member.roles.add).toHaveBeenCalledTimes(0);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, response);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });
});