jest.mock("../src/service");

const { client } = require("../../src/index.js");
const { execute } = require("../../src/events/message");

const { teacherMessageHelp, teacherData, studentMessageHelp, studentData,
  teacherMessageHelpJoin, teacherJoinData, studentMessageHelpIns, studentInsData } = require("../mocks.js");

afterEach(() => {
  jest.clearAllMocks();
});

describe("help command", () => {
  test("help with teacher role should see all commands", async () => {
    await execute(teacherMessageHelp, client);
    expect(teacherMessageHelp.channel.send).toHaveBeenCalledTimes(1);
    expect(teacherMessageHelp.channel.send).toHaveBeenCalledWith(teacherData, { "split": true });
  });

  test("help with student role cannot see teacher commands", async () => {
    await execute(studentMessageHelp, client);
    expect(studentMessageHelp.channel.send).toHaveBeenCalledTimes(1);
    expect(studentMessageHelp.channel.send).toHaveBeenCalledWith(studentData, { "split": true });
  });

  test("help with invalid arg should give error", async () => {
    studentMessageHelp.content = "!help notvalidcommand";
    await execute(studentMessageHelp, client);
    expect(studentMessageHelp.reply).toHaveBeenCalledTimes(1);
    expect(studentMessageHelp.reply).toHaveBeenCalledWith("that's not a valid command!");
  });

  test("help with valid arg should give correct command info", async () => {
    await execute(teacherMessageHelpJoin, client);
    expect(teacherMessageHelpJoin.channel.send).toHaveBeenCalledTimes(1);
    expect(teacherMessageHelpJoin.channel.send).toHaveBeenCalledWith(teacherJoinData, { "split": true });
  });

  test("help with valid arg should give correct command info if no command.usage", async () => {
    await execute(studentMessageHelpIns, client);
    expect(studentMessageHelpIns.channel.send).toHaveBeenCalledTimes(1);
    expect(studentMessageHelpIns.channel.send).toHaveBeenCalledWith(studentInsData, { "split": true });
  });
});