jest.mock("../src/service");
jest.mock("../src/dbInit");
jest.mock("../src/index");

const { execute } = require("../src/events/message");


const { studentMessageCreate, teacherMessageCreateWithoutArgs } = require("./mocks.js");

afterEach(() => {
  jest.clearAllMocks();
});

describe("create command", () => {
  test("student cannot create course", async () => {
    await execute(studentMessageCreate, studentMessageCreate.client);
    expect(studentMessageCreate.channel.send).toHaveBeenCalledTimes(1);
    expect(studentMessageCreate.channel.send).toHaveBeenCalledWith("You have no power here!");
  });

  test("cannot create course without args", async () => {
    await execute(teacherMessageCreateWithoutArgs, teacherMessageCreateWithoutArgs.client);
    expect(teacherMessageCreateWithoutArgs.channel.send).toHaveBeenCalledTimes(1);
    expect(teacherMessageCreateWithoutArgs.channel.send).toHaveBeenCalledWith(`You didn't provide any arguments, ${teacherMessageCreateWithoutArgs.author}!`);
  });
});