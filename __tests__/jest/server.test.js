require("dotenv").config();
const supertest = require("supertest");
const fetch = require("node-fetch");
const { Response } = jest.requireActual("node-fetch");
const SequelizeMock = require("sequelize-mock");
const dbMock = new SequelizeMock();

const makeApp = require("../../src/server/app");

const app = makeApp(dbMock);
const api = supertest(app);

jest.mock("node-fetch");
jest.mock("../../src/server/strategies/discordstrategy", () => jest.fn((req, res, next) => next()));

afterEach(() => {
  jest.clearAllMocks();
});

describe("Endpoint urls", () => {
  test("default url redirects", async () => {
    await api
      .get("/")
      .expect(302);
  });

  test("invalid url returns status 302", async () => {
    await api
      .get("/invalidURL")
      .expect(302);
  });

  test("invalid invite returns status 400", async () => {
    const expectedResponse = [{ name: "test" }];
    fetch.mockResolvedValueOnce(new Response(JSON.stringify(expectedResponse)));
    await api
      .get("/join/invalidURL")
      .expect(400);
  });

  test("authenticate fail return 401", async () => {
    const expectedResponse = [{ name: "test" }];
    fetch.mockResolvedValueOnce(new Response(JSON.stringify(expectedResponse)));
    await api
      .get("/authenticate_faculty")
      .expect(401);
  });

  test("authenticate without faculty role return status 400", async () => {
    const expectedResponse = [{ name: "test" }];
    fetch.mockResolvedValueOnce(new Response(JSON.stringify(expectedResponse)));
    await api
      .get("/authenticate_faculty")
      .set({ employeenumber: 1 })
      .expect(400);
  });
});
