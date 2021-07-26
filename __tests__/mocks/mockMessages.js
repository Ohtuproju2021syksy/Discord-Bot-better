const { client } = require("./mockSlashClient");

const teacher = {
  nickname: "teacher",
  roles: {
    cache: {
      find: () => true,
    },
    add: jest.fn(),
    fetch: jest.fn(),
  },
  fetch: jest.fn(),
};

const messageInGuideChannel = {
  client: client,
  guild: {
    roles: {
      cache: [],
      create: jest.fn(),
    },
  },
  channel: {
    name: "guide",
    send: jest.fn(),
  },
  content: "!join test",
  author: teacher,
  member: teacher,
  react: jest.fn(),
  reply: jest.fn(),
};

module.exports = {
  messageInGuideChannel,
};