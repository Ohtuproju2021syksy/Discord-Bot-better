jest.mock("../../src/discordBot/services/service");

const { execute } = require("../../src/discordBot/commands/student/help");

const { teacherMessageHelp, teacherData, studentMessageHelp, studentData,
  teacherJoinData, studentInsData } = require("../temp/mocks.js");

afterEach(() => {
  jest.clearAllMocks();
});

describe("help command", () => {
  test("help with teacher role should see all commands", async () => {
    await execute(teacherMessageHelp, "");
    expect(teacherMessageHelp.channel.send).toHaveBeenCalledTimes(1);
    expect(teacherMessageHelp.channel.send).toHaveBeenCalledWith(teacherData, { "split": true });
  });

  test("help with student role cannot see teacher commands", async () => {
    await execute(studentMessageHelp, "");
    expect(studentMessageHelp.channel.send).toHaveBeenCalledTimes(1);
    expect(studentMessageHelp.channel.send).toHaveBeenCalledWith(studentData, { "split": true });
  });

  test("help with invalid arg should give error", async () => {
    await execute(studentMessageHelp, "notvalidcommand");
    expect(studentMessageHelp.reply).toHaveBeenCalledTimes(1);
    expect(studentMessageHelp.reply).toHaveBeenCalledWith("that's not a valid command!");
  });

  test("help with valid arg should give correct command info", async () => {
    await execute(teacherMessageHelp, ["join"]);
    expect(teacherMessageHelp.channel.send).toHaveBeenCalledTimes(1);
    expect(teacherMessageHelp.channel.send).toHaveBeenCalledWith(teacherJoinData, { "split": true });
  });

  test("help with valid arg should give correct command info if no command.usage", async () => {
    await execute(studentMessageHelp, ["instructors"]);
    expect(studentMessageHelp.channel.send).toHaveBeenCalledTimes(1);
    expect(studentMessageHelp.channel.send).toHaveBeenCalledWith(studentInsData, { "split": true });
  })
});