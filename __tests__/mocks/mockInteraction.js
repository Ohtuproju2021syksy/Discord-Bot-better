const { client } = require("./mockSlashClient");
const { courseAdminRole, facultyRole } = require("../../config.json");
const prefix = "/";

const teacherData = [];
teacherData.push("Here's a list of all my commands:");
teacherData.push(client.slashCommands.map(command => `${prefix}${command.command.name} - ${command.command.description}`).join("\n"));
teacherData.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);

const studentData = [];
studentData.push("Here's a list of all my commands:");
studentData.push(client.slashCommands
  .filter(command => command.command.role !== facultyRole && command.command.role !== courseAdminRole)
  .map(command => `${prefix}${command.command.name} - ${command.command.description}`).join("\n"));
studentData.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);

const teacherJoinData = [];
client.slashCommands
  .filter(command => command.command.name === "join")
  .map(command => {
    teacherJoinData.push(`**Name:** ${command.command.name}`);
    if (command.command.description) teacherJoinData.push(`**Description:** ${command.command.description}`);
    if (command.command.usage) teacherJoinData.push(`**Usage:** ${prefix}${command.command.name} ${command.command.usage}`);
  });

const studentInsData = [];
client.slashCommands
  .filter(command => command.name === "instructors")
  .map(command => {
    studentInsData.push(`**Name:** ${command.name}`);
    if (command.description) studentInsData.push(`**Description:** ${command.description}`);
    if (command.usage) studentInsData.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);
  });

const teacher = {
  nickname: "teacher",
  roles: {
    cache: [{ name: facultyRole }, { name: `test ${courseAdminRole}` }],
    add: jest.fn((name) => teacher.roles.cache.push({ name: name })),
    highest: { name: facultyRole },
    fetch: jest.fn(),
    remove: jest.fn((role) => teacher.roles.cache = teacher.roles.cache.filter(r => r.name !== role.name)),
  },
  fetch: jest.fn(),
};

const student = {
  nickname: "student",
  roles: {
    cache: [{ name: "student" }],
    add: jest.fn((name) => student.roles.cache.push({ name: name })),
    highest: { name: "@everyone" },
    fetch: jest.fn(),
    remove: jest.fn((role) => student.roles.cache = student.roles.cache.filter(r => r.name !== role.name)),
  },
  fetch: jest.fn(),
};

const guideChannel = {
  name: "guide",
  type: "text",
  parent: null,
  delete: jest.fn(),
};

const testCatecory = {
  name: "📚 test",
  type: "category",
  delete: jest.fn(),
};

const testChannel = {
  name: "test_test",
  parent: testCatecory,
  type: "text",
  delete: jest.fn(),
};

const testChannelGeneral = {
  name: "test_general",
  parent: testCatecory,
  type: "text",
  delete: jest.fn(),
};

const chat = {
  name: "chat",
  type: "text",
  parent: { name: "general", type: "category" },
  delete: jest.fn(),
};

client.guild.members.cache.set(1, teacher);
client.guild.members.cache.set(2, student);
client.guild.channels.cache.set(0, testCatecory);
client.guild.channels.cache.set(1, guideChannel);
client.guild.channels.cache.set(2, testChannel);
client.guild.channels.cache.set(3, testChannelGeneral);
client.guild.channels.cache.set(4, chat);

const defaultTeacherInteraction = {
  client: client,
  channel_id: 1,
  member: {
    user: {
      id: 1,
    },
  },
  data: {
    options: [{
      value: "",
      command: {},
    }],
  },
};

const defaultStudentInteraction = {
  client: client,
  channel_id: 1,
  member: {
    user: {
      id: 2,
    },
  },
  data: {
    options: [{
      value: "",
      command: {},
    }],
  },
};

const teacherInteractionHelp = {
  client: client,
  channel_id: 1,
  member: {
    user: {
      id: 1,
    },
  },
  data: {
    options: false,
  },
};

const studentInteractionHelp = {
  client: client,
  channel_id: 1,
  member: {
    user: {
      id: 2,
    },
  },
  data: {
    options: false,
  },
};

const invalidInteractionHelp = {
  client: client,
  channel_id: 1,
  member: {
    user: {
      id: 2,
    },
  },
  data: {
    options: [{
      value: "invalid",
    }],
  },
};

const interactionHelpJoin = {
  client: client,
  channel_id: 1,
  member: {
    user: {
      id: 1,
    },
  },
  data: {
    options: [{
      value: "join",
      command: {
        name: "join",
        description: "Join a course, e.g. `/join ohpe`",
        usage: "[course name]",
      },
    }],
  },
};

const interactionJoin = {
  client: client,
  channel_id: 1,
  member: {
    user: {
      id: 1,
    },
  },
  data: {
    options: [{
      value: "tester",
      command: {
        name: "join",
      },
    }],
  },
};

const intInsWithoutArgs = {
  client: client,
  channel_id: 1,
  member: {
    user: {
      id: 2,
    },
  },
  data: {
    options: false,
  },
};

const intInsWithValidArgs = {
  client: client,
  channel_id: 1,
  member: {
    user: {
      id: 1,
    },
  },
  data: {
    options: [{
      value: "test",
    }],
  },
};

const intInsWithInvalidArgs = {
  client: client,
  channel_id: 1,
  member: {
    user: {
      id: 1,
    },
  },
  data: {
    options: [{
      value: "tast",
    }],
  },
};

const intInsWithoutArgsInCourseChannelWithAdmins = {
  client: client,
  channel_id: 2,
  member: {
    user: {
      id: 2,
    },
  },
  data: {
    options: false,
  },
};


module.exports = {
  teacherData,
  studentData,
  teacherJoinData,
  studentInsData,
  teacherInteractionHelp,
  studentInteractionHelp,
  invalidInteractionHelp,
  interactionHelpJoin,
  interactionJoin,
  intInsWithoutArgs,
  intInsWithValidArgs,
  intInsWithInvalidArgs,
  intInsWithoutArgsInCourseChannelWithAdmins,
  defaultTeacherInteraction,
  defaultStudentInteraction,
};