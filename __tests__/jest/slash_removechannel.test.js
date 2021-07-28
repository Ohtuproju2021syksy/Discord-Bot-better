const { execute } = require("../../src/discordBot/commands/faculty/removechannel");
const { sendEphemeral } = require("../../src/discordBot/commands/utils");
// const { getRoleFromCategory } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/commands/utils");
// jest.mock("../../src/discordBot/services/service");

/* getRoleFromCategory
  .mockImplementation((name) => `📚 ${name}`)
  .mockImplementationOnce(() => "📚 testa");*/

const { defaultTeacherInteraction } = require("../mocks/mockInteraction");


afterEach(() => {
  jest.clearAllMocks();
});

describe("slash removechannel", () => {
  test("Command cannot be used in normal channel", async () => {
    const courseName = "guide";
    const response = "This command can be used only in course channels";
    defaultTeacherInteraction.data.options[0].value = courseName;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
  });

  test("Command can be used only in course channels", async () => {
    const courseName = "guide";
    const response = "This command can be used only in course channels";
    defaultTeacherInteraction.data.options[0].value = courseName;
    defaultTeacherInteraction.channel_id = 4;
    const client = defaultTeacherInteraction.client;
    client.guild.channels.create("notcourse", "category");
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
  });

  test("Orginals cannot be removed", async () => {
    const courseName = "general";
    const response = "Original channels can not be removed.";
    defaultTeacherInteraction.data.options[0].value = courseName;
    defaultTeacherInteraction.channel_id = 3;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
  });

  test("Invalid channel cannot be removed", async () => {
    const courseName = "invalid";
    const response = "There is not added channel with given name.";
    defaultTeacherInteraction.data.options[0].value = courseName;
    defaultTeacherInteraction.channel_id = 3;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
  });

  test("Valid channel can be removed", async () => {
    const courseName = "test";
    const response = `${courseName} removed!`;
    defaultTeacherInteraction.data.options[0].value = courseName;
    defaultTeacherInteraction.channel_id = 3;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
  });
});