const { execute } = require("../../src/discordBot/commands/faculty/hide");
const { sendEphemeral } = require("../../src/discordBot/commands/utils");
const { createCategoryName, updateGuide, findChannelWithNameAndType, msToMinutesAndSeconds } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/commands/utils");
jest.mock("../../src/discordBot/services/service");

createCategoryName.mockImplementation((name) => `📚 ${name}`);

const { defaultTeacherInteraction } = require("../temp/mockInteraction");

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash hide command", () => {
  test("hide command with invalid course name responds with correct ephemeral", async () => {
    const courseName = "test";
    defaultTeacherInteraction.data.options[0].value = courseName;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(createCategoryName).toHaveBeenCalledTimes(1);
    expect(createCategoryName).toHaveBeenCalledWith(courseName);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, `Invalid course name: ${courseName} or the course is private already.`);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });

  test("hide command with valid course name responds with correct ephemeral", async () => {
    const courseName = "test";
    findChannelWithNameAndType.mockImplementationOnce((name) => { return { name: `📚 ${name}`, setName: jest.fn() }; });
    defaultTeacherInteraction.data.options[0].value = courseName;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(createCategoryName).toHaveBeenCalledTimes(1);
    expect(createCategoryName).toHaveBeenCalledWith(courseName);
    expect(findChannelWithNameAndType).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(client, defaultTeacherInteraction, `This course ${courseName} is now private.`);
    expect(client.emit).toHaveBeenCalledTimes(1);
    expect(updateGuide).toHaveBeenCalledTimes(1);
  });

  test("hide command with cooldown", async () => {
    const courseName = "test";
    findChannelWithNameAndType.mockImplementation((name) => { return { name: `📚 ${name}`, setName: jest.fn() }; });
    defaultTeacherInteraction.data.options[0].value = courseName;
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(createCategoryName).toHaveBeenCalledTimes(1);
    expect(createCategoryName).toHaveBeenCalledWith(courseName);
    expect(findChannelWithNameAndType).toHaveBeenCalledTimes(1);
    expect(msToMinutesAndSeconds).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(client.emit).toHaveBeenCalledTimes(0);
    expect(updateGuide).toHaveBeenCalledTimes(0);
  });
});