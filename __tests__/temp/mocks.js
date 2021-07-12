const { client } = require("./mockClient");
const prefix = process.env.PREFIX;

const teacherData = [];
teacherData.push("Here's a list of all my commands:");
teacherData.push(client.commands.map(command => `${prefix}${command.name} - ${command.description}`).join("\n"));
teacherData.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);

const studentData = [];
studentData.push("Here's a list of all my commands:");
studentData.push(client.commands
  .filter(command => command.role !== "teacher")
  .map(command => `${prefix}${command.name} - ${command.description}`).join("\n"));
studentData.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);

const teacherJoinData = [];
client.commands
  .filter(command => command.name === "join")
  .map(command => {
    teacherJoinData.push(`**Name:** ${command.name}`);
    if (command.description) teacherJoinData.push(`**Description:** ${command.description}`);
    if (command.usage) teacherJoinData.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);
  });

const studentInsData = [];
client.commands
  .filter(command => command.name === "instructors")
  .map(command => {
    studentInsData.push(`**Name:** ${command.name}`);
    if (command.description) studentInsData.push(`**Description:** ${command.description}`);
    if (command.usage) studentInsData.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);
  });

const teacher = {
  nickname: "teacher",
  roles: {
    cache: {
      find: () => true,
    },
    add: jest.fn(),
    fetch: jest.fn(),
  },
};

const student = {
  nickname: "student",
  roles: {
    cache: {
      find: () => false,
    },
    add: jest.fn(),
    fetch: jest.fn(),
  },
};

const teacherMessageHelp = {
  client: client,
  channel: {
    send: jest.fn(),
  },
  content: "!help",
  author: {
    bot: false,
  },
  member: teacher,
  react: jest.fn(),
  reply: jest.fn(),
};

const studentMessageHelp = {
  client: client,
  channel: {
    send: jest.fn(),
  },
  content: "!help",
  author: {
    bot: false,
  },
  member: student,
  react: jest.fn(),
  reply: jest.fn(),
};
// extra
const teacherMessageHelpJoin = {
  client: client,
  channel: {
    send: jest.fn(),
  },
  content: "!help join",
  author: {
    bot: false,
  },
  member: teacher,
  react: jest.fn(),
  reply: jest.fn(),
};
// extra
const studentMessageHelpIns = {
  client: client,
  channel: {
    send: jest.fn(),
  },
  content: "!help instructors",
  author: {
    bot: false,
  },
  member: student,
  react: jest.fn(),
  reply: jest.fn(),
};

const instructorsMessageOutsideCourseChannels = {
  client: client,
  guild: {
    roles: {
      cache: {
        find: jest.fn(() => false),
      },
    },
  },
  channel: {
    parent: {
      name: "test",
    },
    send: jest.fn(),
  },
  content: "!instructors",
  author: {
    bot: false,
  },
  member: student,
  react: jest.fn(),
  reply: jest.fn(),
};

const instructorsMessageOutsideCourseChannelsWithoutRoles = {
  client: client,
  guild: {
    roles: {
      cache: {
        find: jest.fn(() => { return { name: "test admin", members: [] }; }),
      },
    },
  },
  channel: {
    parent: {
      name: "test",
    },
    send: jest.fn(),
  },
  content: "!instructors",
  author: {
    bot: false,
  },
  member: student,
  react: jest.fn(),
  reply: jest.fn(),
};

const instructorsMessageOutsideCourseChannelsWithRoles = {
  client: client,
  guild: {
    roles: {
      cache: {
        find: jest.fn(() => { return { name: "test admin", members: [teacher] }; }),
      },
    },
  },
  channel: {
    parent: {
      name: "test",
    },
    send: jest.fn(),
  },
  content: "!instructors",
  author: {
    bot: false,
  },
  member: student,
  react: jest.fn(),
  reply: jest.fn(),
};

const studentMessageCreate = {
  client: client,
  channel: {
    send: jest.fn(),
  },
  content: "!create test",
  author: student,
  member: student,
  react: jest.fn(),
  reply: jest.fn(),
};

const teacherMessageCreateWithoutArgs = {
  client: client,
  channel: {
    send: jest.fn(),
  },
  content: "!create",
  author: teacher,
  member: teacher,
  react: jest.fn(),
  reply: jest.fn(),
};

const joinMessage = {
  client: client,
  guild: {
    roles: {
      cache: {
        find: jest.fn(),
      },
      create: jest.fn(),
    },
  },
  channel: {
    send: jest.fn(),
  },
  content: "!join test",
  author: teacher,
  member: teacher,
  react: jest.fn(),
  reply: jest.fn(),
};

module.exports = {
  teacherData,
  studentData,
  teacherJoinData,
  studentInsData,
  teacherMessageHelp,
  studentMessageHelp,
  teacherMessageHelpJoin,
  studentMessageHelpIns,
  instructorsMessageOutsideCourseChannels,
  instructorsMessageOutsideCourseChannelsWithoutRoles,
  instructorsMessageOutsideCourseChannelsWithRoles,
  studentMessageCreate,
  teacherMessageCreateWithoutArgs,
  joinMessage,
};