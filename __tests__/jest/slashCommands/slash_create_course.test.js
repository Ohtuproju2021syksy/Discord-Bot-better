const { execute } = require("../../../src/discordBot/commands/faculty/create_course");
const { sendEphemeral, sendErrorEphemeral, editEphemeral } = require("../../../src/discordBot/services/message");
const { containsEmojis } = require("../../../src/discordBot/services/service");
const { findCourseFromDb, findCourseFromDbWithFullName, createCourseToDatabase } = require("../../../src/db/services/courseService");
const models = require("../../mocks/mockModels");

jest.mock("../../../src/discordBot/services/message");
jest.mock("../../../src/discordBot/services/service");
jest.mock("../../../src/db/services/courseService");
jest.mock("../../../src/db/services/channelService");

findCourseFromDbWithFullName
  .mockImplementation(() => false)
  .mockImplementationOnce(() => true);
findCourseFromDb
  .mockImplementation(() => false)
  .mockImplementationOnce(() => true)
  .mockImplementationOnce(() => true);

createCourseToDatabase.mockImplementation(() => {return { name: "nickname", id:  Math.floor(Math.random() * 10) + 5 }; });

const { defaultTeacherInteraction, defaultStudentInteraction } = require("../../mocks/mockInteraction");
defaultTeacherInteraction.options = {
  getString: jest.fn((name) => {
    const names = {
      coursecode: "TKT-100",
      full_name: "Long course name",
      nick_name: "nickname",
    };
    return names[name];
  }),
};

defaultStudentInteraction.options = {
  getString: jest.fn((name) => {
    const names = {
      coursecode: "TKT-100",
      full_name: "Long course name",
    };
    return names[name];
  }),
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("slash create command", () => {
  test("course name must be unique", async () => {
    const client = defaultTeacherInteraction.client;
    const response = "Course fullname must be unique.";
    await execute(defaultTeacherInteraction, client, models);
    expect(findCourseFromDbWithFullName).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("course nick name must be unique", async () => {
    const client = defaultTeacherInteraction.client;
    const response = "Course nick name must be unique.";
    await execute(defaultTeacherInteraction, client, models);
    expect(findCourseFromDbWithFullName).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, response);
  });

  test("course code must be unique when nickname not given", async () => {
    const client = defaultStudentInteraction.client;
    const response = "Course code must be unique.";
    await execute(defaultStudentInteraction, client, models);
    expect(findCourseFromDbWithFullName).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultStudentInteraction, response);
  });

  test("create course name without nick", async () => {
    const courseCode = "TKT-100";
    const fullName = "Long course name";
    const client = defaultStudentInteraction.client;
    await execute(defaultStudentInteraction, client, models);
    expect(createCourseToDatabase).toHaveBeenCalledTimes(1);
    expect(createCourseToDatabase).toHaveBeenCalledWith(courseCode, fullName, courseCode.toLowerCase(), models.Course);
  });

  test("respond with correct emphemeral", async () => {
    const courseName = "nickname";
    const client = defaultTeacherInteraction.client;
    const result = `Created course ${courseName}.`;
    await execute(defaultTeacherInteraction, client, models);
    expect(sendEphemeral).toHaveBeenCalledTimes(1);
    expect(sendEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, "Creating course...");
    expect(editEphemeral).toHaveBeenCalledTimes(1);
    expect(editEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, result);
  });

  test("fails if parameters are too long", async () => {
    defaultTeacherInteraction.options = {
      getString: jest.fn((name) => {
        const names = {
          coursecode: "What the fuck did you just fucking say about me, you little bitch? I'll have you know I graduated top of my class in the Navy Seals, " +
          "and I've been involved in numerous secret raids on Al-Quaeda, and I have over 300 confirmed kills. I am trained in gorilla warfare and I'm the top sniper in " +
          "the entire US armed forces. You are nothing to me but just another target. I will wipe you the fuck out with precision the likes of which has never been seen " +
          "before on this Earth, mark my fucking words.",
          full_name: "You think you can get away with saying that shit to me over the Internet? Think again, fucker. As we speak I am contacting my secret" +
          "network of spies across the USA and your IP is being traced right now so you better prepare for the storm, maggot. The storm that wipes out the pathetic " +
          "little thing you call your life. You're fucking dead, kid. I can be anywhere, anytime, and I can kill you in over seven hundred ways, and that's just with my bare hands.",
          nick_name: "Not only am I extensively trained in unarmed combat, but I have access to the entire arsenal of the United States Marine Corps and I will use it to" +
          "its full extent to wipe your miserable ass off the face of the continent, you little shit. If only you could have known what unholy retribution your little" +
          "'clever' comment was about to bring down upon you, maybe you would have held your fucking tongue. But you couldn't, you didn't, and now you're paying the price, " +
          "you goddamn idiot. I will shit fury all over you and you will drown in it. You're fucking dead, kiddo.",
        };
        return names[name];
      }),
    };
    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, models);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, "Course code, name and nickname are too long!");
  });

  test("fails if code contains emoji", async () => {
    defaultTeacherInteraction.options = {
      getString: jest.fn((name) => {
        const names = {
          coursecode: "TKT-100🤔",
          full_name: "Long course name",
          nick_name: "nickname",
        };
        return names[name];
      }),
    };
    containsEmojis.mockImplementationOnce(() => true);

    const client = defaultTeacherInteraction.client;
    await execute(defaultTeacherInteraction, client, models);
    expect(containsEmojis).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledTimes(1);
    expect(sendErrorEphemeral).toHaveBeenCalledWith(defaultTeacherInteraction, "Emojis are not allowed!");
  });

});
