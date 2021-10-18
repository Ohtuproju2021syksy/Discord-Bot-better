const mockCourse = jest.mock("../../src/db/models/Course");
const mockChannel = jest.mock("../../src/db/models/Channel");
const mockUser = jest.mock("../../src/db/models/User");
const mockCourseMember = jest.mock("../../src/db/models/CourseMember");

const models = { Course: mockCourse, Channel: mockChannel, User: mockUser, CourseMember: mockCourseMember };

module.exports = models;