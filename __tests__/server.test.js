const supertest = require("supertest");
const server = require("../src/server");

const api = supertest(server);

test("default url ok", async () => {
  await api
    .get("/")
    .expect(200);
});
test("invalid invite returns status 400", async () => {
  await api
    .get("/invite/invalidURL")
    .expect(400);
});
test("invalid url redirects root and return status ok", async () => {
  await api
    .get("/invalidURL")
    .expect(302);
});
test("valid url return status ok", async () => {
  await api
    .get("/invite/test")
    .expect(200);
});