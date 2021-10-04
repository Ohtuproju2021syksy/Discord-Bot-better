const { execute } = require("../../src/discordBot/commands/student/auth");
const { sendEphemeral, editEphemeral } = require("../../src/discordBot/services/message");

jest.mock("../../src/discordBot/services/message");

const { defaultTeacherInteraction } = require("../mocks/mockInteraction");
const initialResponse = "Hold on...";

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash auth command", () => {
  test("auth command responds with correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, initialResponse);
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, `${process.env.BACKEND_SERVER_URL}/authenticate_faculty`);
  });
});