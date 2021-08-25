const { getCourseChoices } = require("../../src/discordBot/commands/utils");
const { findCoursesFromDb } = require("../../src/discordBot/services/service");

jest.mock("../../src/discordBot/services/service");

const courses = [{ code: "tkt100en", fullName: "test course", name: "test" }];

findCoursesFromDb.mockImplementation(() => courses);

afterEach(() => {
  jest.clearAllMocks();
});

describe("Utils", () => {
  test("Choices have correct style and size", async () => {
    const code = "TKT100en";
    const fullname = "Test course";
    const name = "test";
    const expected = [{
      name: `${code} - ${fullname} - ${name}`,
      value: name,
    }];
    const result = await getCourseChoices(false);
    expect(result).toStrictEqual(expected);
  });
});