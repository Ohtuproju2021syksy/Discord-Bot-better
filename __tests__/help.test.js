const { client } = require("../src/index.js");
const { teacherMessage, teacherData, studentMessage, studentData,
  teacherMessageHelpJoin, teacherJoinData, studentMessageHelpIns, studentInsData } = require("./mocks.js");

const { execute } = require("../src/events/message");

afterEach(() => {
  jest.clearAllMocks();
});

describe("channels", () => {
  test("help with teacher role should see all commands", async () => {
    await execute(teacherMessage, client);
    expect(teacherMessage.channel.send).toHaveBeenCalledTimes(1);
    expect(teacherMessage.channel.send).toHaveBeenCalledWith(teacherData, { "split": true });
  });

  test("help with student role cannot see teacher commands", async () => {
    await execute(studentMessage, client);
    expect(studentMessage.channel.send).toHaveBeenCalledTimes(1);
    expect(studentMessage.channel.send).toHaveBeenCalledWith(studentData, { "split": true });
  });

  test("help with invalid arg should give error", async () => {
    studentMessage.content = "!help notvalidcommand";
    await execute(studentMessage, client);
    expect(studentMessage.reply).toHaveBeenCalledTimes(1);
    expect(studentMessage.reply).toHaveBeenCalledWith("that's not a valid command!");
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