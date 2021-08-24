const { client } = require("./mockSlashClient");
const { courseAdminRole, facultyRole } = require("../../config.json");
const prefix = "/";

const adminD = client.commands.map(c => c);
const faculty = client.slashCommands.map(c => c.command).filter(command => command.role).filter(command => command.role !== courseAdminRole);
const courseAdmin = client.slashCommands.map(c => c.command).filter(command => command.role === courseAdminRole);
const studentD = client.slashCommands.map(c => c.command).filter(command => !command.role && command.name !== "auth");

const teacherData = [];
teacherData.push("Hi **teacher**!\n");
teacherData.push("Here's a list of commands you can use:\n");
teacherData.push(`Category: **${facultyRole}**`);
teacherData.push(faculty.map(command => `**${prefix}${command.name}** - ${command.description}`).join("\n"));
teacherData.push("\n");
teacherData.push(`Category: **${courseAdminRole}**`);
teacherData.push(courseAdmin.map(command => `**${prefix}${command.name}** - ${command.description}`).join("\n"));
teacherData.push("\n");
teacherData.push("Category: **default**");
teacherData.push(studentD.map(command => `**${prefix}${command.name}** - ${command.description}`).join("\n"));
teacherData.push("\n");
teacherData.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);

const studentData = [];
studentData.push("Hi **student**!\n");
studentData.push("Here's a list of commands you can use:\n");
studentData.push("Category: **default**");
studentData.push(studentD.map(command => `**${prefix}${command.name}** - ${command.description}`).join("\n"));
studentData.push("\n");
studentData.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);

const adminData = [];
adminData.push("Hi **admin**!\n");
adminData.push("Here's a list of commands you can use:\n");
adminData.push("Category: **admin**");
adminData.push(adminD.map((command) => `**!${command.name}** - ${command.description}`).join("\n"));
adminData.push("\n");
adminData.push(`Category: **${facultyRole}**`);
adminData.push(faculty.map(command => `**${prefix}${command.name}** - ${command.description}`).join("\n"));
adminData.push("\n");
adminData.push(`Category: **${courseAdminRole}**`);
adminData.push(courseAdmin.map(command => `**${prefix}${command.name}** - ${command.description}`).join("\n"));
adminData.push("\n");
adminData.push("Category: **default**");
adminData.push(studentD.map(command => `**${prefix}${command.name}** - ${command.description}`).join("\n"));
adminData.push("\n");
adminData.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);

const teacherJoinData = [];
client.slashCommands
  .map(c => c.command)
  .filter(command => command.name === "join")
  .map(command => {
    teacherJoinData.push(`**Name:** ${command.name}`);
    if (command.description) teacherJoinData.push(`**Description:** ${command.description}`);
    if (command.usage) teacherJoinData.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);
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
  id: 1,
  nickname: "teacher",
  roles: {
    cache: [{ name: facultyRole }, { name: `test ${courseAdminRole}` }],
    add: jest.fn((name) => teacher.roles.cache.push({ name: name })),
    highest: { name: facultyRole },
    fetch: jest.fn(),
    remove: jest.fn((role) => teacher.roles.cache = teacher.roles.cache.filter(r => r.name !== role.name)),
  },
  fetch: jest.fn(),
  displayName: "teacher",
};

const student = {
  id: 2,
  nickname: "student",
  roles: {
    cache: [{ name: "student" }],
    add: jest.fn((name) => student.roles.cache.push({ name: name })),
    highest: { name: "@everyone" },
    fetch: jest.fn(),
    remove: jest.fn((role) => student.roles.cache = student.roles.cache.filter(r => r.name !== role.name)),
  },
  fetch: jest.fn(),
  displayName: "student",
};

const admin = {
  id: 2,
  nickname: "admin",
  roles: {
    cache: [{ name: "admin" }],
    add: jest.fn((name) => admin.roles.cache.push({ name: name })),
    highest: { name: "admin" },
    fetch: jest.fn(),
    remove: jest.fn((role) => admin.roles.cache = admin.roles.cache.filter(r => r.name !== role.name)),
  },
  fetch: jest.fn(),
  displayName: "admin",
};

const guideChannel = {
  name: "guide",
  type: "text",
  parent: undefined,
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
  setTopic: jest.fn(),
};

const testChannelAccouncement = {
  name: "test_announcement",
  parent: testCatecory,
  type: "text",
  delete: jest.fn(),
  setTopic: jest.fn(),
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
client.guild.channels.cache.set(5, testChannelAccouncement);
client.guild.roles.cache.set(1, { name: "test" });
client.guild.roles.cache.set(2, { name: `${courseAdminRole}_test` });
client.guild.roles.cache.set(3, { name: "admin" });
client.guild.roles.cache.set(4, { name: facultyRole });
client.guild.members.cache.set(1, teacher);
client.guild.members.cache.set(2, student);
client.guild.members.cache.set(3, admin);

const defaultTeacherInteraction = {
  client: client,
  channel_id: 1,
  member: {
    user: teacher,
    roles: [1, 3, 4],
  },
  data: {
    options: [
      {
        value: "",
        command: {},
      },
      {
        value: "",
        command: {},
      },
    ],
  },
};

const defaultStudentInteraction = {
  client: client,
  channel_id: 1,
  member: {
    user: student,
    roles: [],
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

const studentInteractionWithoutOptions = {
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

const defaultAdminInteraction = {
  client: client,
  channel_id: 1,
  member: {
    user: {
      id: 3,
    },
  },
  data: {
    options: false,
  },
};

module.exports = {
  adminData,
  teacherData,
  studentData,
  teacherJoinData,
  studentInsData,
  teacherInteractionHelp,
  studentInteractionWithoutOptions,
  defaultTeacherInteraction,
  defaultStudentInteraction,
  defaultAdminInteraction,
};