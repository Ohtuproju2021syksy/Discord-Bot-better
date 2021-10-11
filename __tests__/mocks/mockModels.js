const mockCourse = jest.mock("../../src/db/models/Course");
const mockChannel = jest.mock("../../src/db/models/Channel");

const models = { Course: mockCourse, Channel: mockChannel };

module.exports = models;