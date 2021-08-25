const { client } = require("./mockSlashClient");

const teacher = {
  nickname: "teacher",
  hasPermission: jest.fn(() => true),
  roles: {
    cache: {
      find: () => true,
    },
    add: jest.fn(),
    fetch: jest.fn(),
  },
  fetch: jest.fn(),
};

const student = {
  nickname: "student",
  hasPermission: jest.fn(() => false),
  roles: {
    cache: {
      find: () => false,
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
  content: "",
  author: teacher,
  member: teacher,
  react: jest.fn(),
  reply: jest.fn(),
};

const messageInCommandsChannel = {
  client: client,
  guild: {
    roles: {
      cache: [],
      create: jest.fn(),
    },
    channels: {
      cache: [
        {
          name: "test_announcement",
          messages: {
            fetchPinned: jest.fn(() => { return [{ author: client.user, content: "Invitation link for", edit: jest.fn() }]; }),
          },
          parent: {
            name: "📚 test",
            type: "category",
          },
        },
        {
          name: "📚 test",
          type: "category",
          delete: jest.fn(),
        },
      ],
    },
  },
  channel: {
    name: "commands",
    send: jest.fn(),
  },
  content: "",
  author: teacher,
  member: teacher,
  react: jest.fn(),
  reply: jest.fn(),
};

module.exports = {
  messageInGuideChannel,
  messageInCommandsChannel,
  student,
  teacher,
};