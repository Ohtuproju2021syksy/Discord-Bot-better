const { execute } = require("../../../src/discordBot/commands/student/courses");
const { editEphemeral, editErrorEphemeral, sendEphemeral } = require("../../../src/discordBot/services/message");
const { findCoursesFromDb } = require("../../../src/db/services/courseService");
const models = require("../../mocks/mockModels");

jest.mock("../../../src/discordBot/services/message");
jest.mock("../../../src/discordBot/services/service");
jest.mock("../../../src/db/services/courseService");

const course = [{ code: "tkt test", fullName: "test course", name: "test" }];
const initialResponse = "Fetching courses...";

findCoursesFromDb
  .mockImplementation(() => course)
  .mockImplementationOnce(() => []);

const { defaultTeacherInteraction } = require("../../mocks/mockInteraction");

afterEach(() => {
  jest.clearAllMocks();
});

describe("courses slash command", () => {
  test("If no courses: responds with no courses available ephemeral", async () => {
    const result = "No courses available";
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, result);
  });

  test("responds correct list as ephemeral", async () => {
    const result = "test course - `/join test`";
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, result);
  });
});