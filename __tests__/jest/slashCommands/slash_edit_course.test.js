const { execute } = require("../../../src/discordBot/commands/faculty/edit_course");
const { sendEphemeral, editErrorEphemeral, editEphemeral } = require("../../../src/discordBot/services/message");
const { confirmChoice } = require("../../../src/discordBot/services/confirm");
const {
  findCategoryWithCourseName,
  msToMinutesAndSeconds,
  getCourseNameFromCategory,
  checkCourseCooldown,
  findChannelWithNameAndType,
  isCourseCategory } = require("../../../src/discordBot/services/service");
const { findCourseFromDb } = require("../../../src/db/services/courseService");
const { editChannelNames } = require("../../../src/db/services/channelService");

const models = require("../../mocks/mockModels");

jest.mock("../../../src/discordBot/services/message");
jest.mock("../../../src/discordBot/services/confirm");
jest.mock("../../../src/discordBot/services/service");
jest.mock("../../../src/db/services/courseService");
jest.mock("../../../src/db/services/channelService");

const time = "4:59";
confirmChoice.mockImplementation(() => true);
msToMinutesAndSeconds.mockImplementation(() => time);
findCategoryWithCourseName.mockImplementation((name) => ({ name: `📚 ${name}` }));
getCourseNameFromCategory.mockImplementation(() => "test");

isCourseCategory.mockImplementationOnce(() => (false));
isCourseCategory.mockImplementation(() => (true));

editChannelNames.mockImplementation(() => null);

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
        new_value: "testing",
      };
      return options[option];
    })
    .mockImplementationOnce((option) => {
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
    findCourseFromDb.mockImplementationOnce(() => {
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
      .mockImplementationOnce(() => {
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
    checkCourseCooldown.mockImplementationOnce(() => time);
    const client = defaultTeacherInteraction.client;
    defaultTeacherInteraction.channelId = 2;
    const response = `Command cooldown [mm:ss]: you need to wait ${time}.`;
    await execute(defaultTeacherInteraction, client, models);
    expect(confirmChoice).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, "Editing...");
    expect(editErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(editErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

});
