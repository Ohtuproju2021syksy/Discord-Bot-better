const { execute } = require("../../src/discordBot/commands/admin/remove");
const { sendEphemeral } = require("../../src/discordBot/commands/utils");
const { findCategoryName, updateGuide, removeCourseFromDb } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/commands/utils");
jest.mock("../../src/discordBot/services/service");

findCategoryName
  .mockImplementation((name) => `📚 ${name}`)
  .mockImplementationOnce(() => "📚 testa");

const { defaultTeacherInteraction } = require("../mocks/mockInteraction");


afterEach(() => {
  jest.clearAllMocks();
});

describe("slash remove", () => {
  test("remove command with invalid course name responds correct ephemeral", async () => {
    const courseName = "test";
    const response = `Invalid course name: ${courseName}.`;
    defaultTeacherInteraction.data.options[0].value = courseName;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(findCategoryName).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
  });

  test("remove command with valid course name responds correct ephemeral", async () => {
    const courseName = "test";
    const response = `Deleted course ${courseName}.`;
    defaultTeacherInteraction.data.options[0].value = courseName;
    const client = defaultTeacherInteraction.client;
    client.guild.roles.create({ data: { name: courseName, members: [] } });
    await execute(defaultTeacherInteraction, client);
    expect(findCategoryName).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, response);
    expect(client.emit).toHaveBeenCalledTimes(1);
    expect(updateGuide).toHaveBeenCalledTimes(1);
    expect(removeCourseFromDb).toHaveBeenCalledTimes(1);
    client.guild.roles.init();
  });
});