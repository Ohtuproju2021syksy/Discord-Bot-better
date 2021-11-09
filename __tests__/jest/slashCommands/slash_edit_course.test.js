const { execute } = require("../../../src/discordBot/commands/faculty/edit_course");
const { sendEphemeral, editErrorEphemeral, editEphemeral, confirmChoice } = require("../../../src/discordBot/services/message");
const {
  findCategoryWithCourseName,
  msToMinutesAndSeconds,
  getCourseNameFromCategory,
  findCourseFromDb,
  checkCourseCooldown,
  isCourseCategory,
  findChannelWithNameAndType } = require("../../../src/discordBot/services/service");
const models = require("../../mocks/mockModels");

jest.mock("../../../src/discordBot/services/message");
jest.mock("../../../src/discordBot/services/service");
confirmChoice.mockImplementation(() => true);

const time = "4:59";
msToMinutesAndSeconds.mockImplementation(() => time);
findCategoryWithCourseName.mockImplementation((name) => ({ name: `📚 ${name}` }));
getCourseNameFromCategory.mockImplementation(() => "test");

isCourseCategory.mockImplementationOnce(() => (false));
isCourseCategory.mockImplementation(() => (true));
findChannelWithNameAndType.mockImplementation(() => {
  return {
    code: "test",
    name: "test2",
    save: jest.fn(),
  };
});

const { defaultTeacherInteraction, defaultStudentInteraction } = require("../../mocks/mockInteraction");
defaultTeacherInteraction.options = {
  getString: jest
    .fn((option) => {
      const options = {
        options: "code",
        new_value: "test",
      };
      return options[option];
    })
    .mockImplementationOnce((option) => {
      const options = {
        options: "code",
        new_value: "test",
      };
      return options[option];
    }),
};

defaultStudentInteraction.options = {
  getString: jest.fn((name) => {
    const names = {
      coursecode: "test",
      full_name: "Long course name",
    };
    return names[name];
  }),
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash edit command", () => {
  test("if not course channel responds with correct ephemeral", async () => {
    const client = defaultTeacherInteraction.client;
    const response = "This is not a course category, can not execute the command";
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, "Editing...");
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("if target channel code exists with correct ephemeral", async () => {
    findCourseFromDb.mockImplementation(() => {
      return {
        code: "test2",
        name: "test2",
      };
    });
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 2;
    const response = "Course code already exists";
    await execute(defaultTeacherInteraction, client, models);
    expect(confirmChoice).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, "Editing...");
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("edit with valid args responds with correct ephemeral", async () => {
    findCourseFromDb
      .mockImplementation(() => {
        return {
          code: "tkt",
          name: "test",
          save: jest.fn(),
        };
      });
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 2;
    const response = "Course information has been changed";
    await execute(defaultTeacherInteraction, client, models);
    expect(confirmChoice).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, "Editing...");
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("command has cooldown", async () => {
    findCourseFromDb
      .mockImplementation(() => {
        ({
          code: "tkt",
          name: "test",
          save: jest.fn(),
        });
      });
    checkCourseCooldown.mockImplementation(() => time);
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 2;
    const response = `Command cooldown [mm:ss]: you need to wait ${time}.`;
    await execute(defaultTeacherInteraction, client), models;
    expect(confirmChoice).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, "Editing...");
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });
});
