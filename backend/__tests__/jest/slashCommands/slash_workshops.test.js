const { execute } = require("../../../src/discordBot/commands/student/workshops");
const { sendEphemeral, editErrorEphemeral, editEphemeral } = require("../../../src/discordBot/services/message");
const { getWorkshopInfo, getCourseNameFromCategory } = require("../../../src/discordBot/services/service");
const { findCourseFromDb } = require("../../../src/db/services/courseService");
const models = require("../../mocks/mockModels");


jest.mock("../../../src/discordBot/services/message");
jest.mock("../../../src/discordBot/services/service");
jest.mock("../../../src/db/services/courseService");

const course = { name: "test", fullName: "test course", code: "101", private: false };
const initialResponse = "Fetching info...";
getCourseNameFromCategory.mockImplementation((name) => name.replace("📚", "").trim());
findCourseFromDb.mockImplementation(() => course);
getWorkshopInfo.mockImplementation(() =>"Monday, November 29, 2021 Between: 14:00 - 16:00 Location: BK107 Instructor: Pekka Puupää Description:");

const { defaultStudentInteraction } = require("../../mocks/mockInteraction");

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash workshops command", () => {
  test("command in a channel with no parent", async () => {
    defaultStudentInteraction.channelId = 6;
    const client = defaultStudentInteraction.client;
    const response = "Course not found, execution stopped.";
    await execute(defaultStudentInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, response);
  });

  test("command doesn't work in a non-course channel", async () => {
    defaultStudentInteraction.channelId = 3;
    const client = defaultStudentInteraction.client;
    findCourseFromDb.mockImplementationOnce(() => null);
    const response = "Command must be used in a course channel!";
    await execute(defaultStudentInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, initialResponse);
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, response);
  });

  test("command works in a course channel", async () => {
    defaultStudentInteraction.channelId = 3;
    const client = defaultStudentInteraction.client;
    const response = "Monday, November 29, 2021 Between: 14:00 - 16:00 Location: BK107 Instructor: Pekka Puupää Description:";
    await execute(defaultStudentInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, initialResponse);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, response);
  });
});