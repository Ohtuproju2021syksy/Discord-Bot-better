const { client } = require("./mockSlashClient");

const teacher = {
  nickname: "teacher",
  user: {
    id: 1,
  },
  permissions: {
    has: jest.fn(() => true),
  },
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
  user: {
    id: 2,
  },
  permissions: {
    has: jest.fn(() => false),
  },
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
  id: 1,
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
  id: 2,
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
            type: "GUILD_CATEGORY",
          },
        },
        {
          name: "📚 test",
          type: "GUILD_CATEGORY",
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