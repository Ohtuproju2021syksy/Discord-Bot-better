const supertest = require("supertest");
const fetch = require("node-fetch");
const { Response } = jest.requireActual("node-fetch");
const SequelizeMock = require("sequelize-mock");
const dbMock = new SequelizeMock();

const makeApp = require("../../../src/server/app");

const CourseMock = dbMock.define("Course", {
  id: 1,
  code: "TKT101",
  fullname: "Test course",
  name: "tk",
  telegramId: "12",
  private: false,
  locked: false,
});

const app = makeApp(dbMock);
const api = supertest(app);

jest.mock("node-fetch");
jest.mock("../../../src/db/dbInit.js");

afterEach(() => {
  jest.clearAllMocks();
});

describe("api/courses", () => {
  test("Default url returns courses", async () => {
    const expectedResponse = [{ id: 1, code: "TKT101", fullname: "Test course", name: "tk" }];
    fetch.mockResolvedValueOnce(new Response(JSON.stringify(expectedResponse)));
    await api
      .get("/api/courses")
      .expect(200);
  });
});