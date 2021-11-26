const { setCourseToPrivate, setCourseToPublic } = require("../../../src/db/services/courseService");

const models = require("../../mocks/mockDb");

describe("Service", () => {
  test("can set course to private", async () => {
    await setCourseToPrivate("test", models.Course);
  });

  test("can set course to public", async () => {
    await setCourseToPublic("privateTest", models.Course);
  });
});
