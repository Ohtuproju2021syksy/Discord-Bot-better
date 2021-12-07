const { client } = require("./mockSlashClient");
const { courseAdminRole, facultyRole, githubRepo } = require("../../config.json");
const prefix = "/";

const adminD = client.commands.map(c => c);
const faculty = client.slashCommands.filter(command => command.roles).filter(command => !command.roles.includes(courseAdminRole));
const studentD = client.slashCommands.filter(command => !command.roles && command.name !== "auth");

const teacherData = [];
const teacherData2 = [];
teacherData.push("Hi **teacher**!\n");
teacherData.push("Here's a list of commands you can use:\n");
teacherData.push("Category: **default**");
teacherData.push(studentD.map(command => `**${command.usage}** - ${command.description}`).join("\n"));
teacherData.push(`[User manual for students](<${githubRepo}/blob/main/documentation/usermanual-student.md>)`);
teacherData.push("\n");
teacherData2.push(`Category: **${facultyRole}**`);
teacherData2.push(faculty.map(command => `**${command.usage}** - ${command.description}`).join("\n"));
teacherData2.push(`[User manual for faculty](<${githubRepo}/blob/main/documentation//usermanual-faculty.md>)`);
teacherData2.push("\n");
teacherData2.push("*Commands can be used only in course channels");
teacherData2.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);

const studentData = [];
studentData.push("Hi **student**!\n");
studentData.push("Here's a list of commands you can use:\n");
studentData.push("Category: **default**");
studentData.push(studentD.map(command => `**${command.usage}** - ${command.description}`).join("\n"));
studentData.push(`[User manual for students](<${githubRepo}/blob/main/documentation/usermanual-student.md>)`);
studentData.push("\n");
studentData.push("*Commands can be used only in course channels");
studentData.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);

const adminData = [];
const adminData2 = [];
adminData.push("Hi **admin**!\n");
adminData.push("Here's a list of commands you can use:\n");
adminData.push("Category: **default**");
adminData.push(studentD.map(command => `**${command.usage}** - ${command.description}`).join("\n"));
adminData.push(`[User manual for students](<${githubRepo}/blob/main/documentation/usermanual-student.md>)`);
adminData.push("\n");
adminData.push("Category: **admin**");
adminData.push(adminD.map((command) => `**${command.usage}** - ${command.description}`).join("\n"));
adminData.push("\n");
adminData2.push(`Category: **${facultyRole}**`);
adminData2.push(faculty.map(command => `**${command.usage}** - ${command.description}`).join("\n"));
adminData2.push(`[User manual for faculty](<${githubRepo}/blob/main/documentation//usermanual-faculty.md>)`);
adminData2.push("\n");
adminData2.push("*Commands can be used only in course channels");
adminData2.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);

const studentJoinData = [];
client.slashCommands
  .filter(command => command.data.name === "join")
  .map(command => {
    studentJoinData.push("Hi **student**!\n");
    studentJoinData.push(`Command **${command.data.name}** info:\n`);
    studentJoinData.push(`**Name:** ${command.data.name}`);
    studentJoinData.push(`**Description:** ${command.description}`);
    studentJoinData.push(`**Usage:** ${command.usage}`);
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
  _roles: [1, 3, 4],
  fetch: jest.fn(),
  displayName: "teacher",
  user: {
    id: 1,
  },
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
  _roles: [3],
  fetch: jest.fn(),
  displayName: "student",
  user: {
    id: 2,
  },
};

const admin = {
  id: 3,
  nickname: "admin",
  roles: {
    cache: [{ name: "admin" }],
    add: jest.fn((name) => admin.roles.cache.push({ name: name })),
    highest: { name: "admin" },
    fetch: jest.fn(),
    remove: jest.fn((role) => admin.roles.cache = admin.roles.cache.filter(r => r.name !== role.name)),
  },
  _roles: [2, 3],
  fetch: jest.fn(),
  displayName: "admin",
  user: {
    id: 3,
    bot: false,
  },
};

const guideChannel = {
  name: "guide",
  type: "GUILD_TEXT",
  parent: undefined,
  delete: jest.fn(),
};

const testCatecory = {
  name: "📚 test",
  type: "GUILD_CATEGORY",
  delete: jest.fn(),
};

const testChannel = {
  name: "test_test",
  parent: testCatecory,
  type: "GUILD_TEXT",
  delete: jest.fn(),
};

const testChannelGeneral = {
  name: "test_general",
  parent: testCatecory,
  type: "GUILD_TEXT",
  delete: jest.fn(),
  setTopic: jest.fn(),
};

const testChannelAccouncement = {
  name: "test_announcement",
  parent: testCatecory,
  type: "GUILD_TEXT",
  delete: jest.fn(),
  setTopic: jest.fn(),
};

const chat = {
  name: "chat",
  type: "GUILD_TEXT",
  parent: { name: "general", type: "GUILD_TEXT" },
  delete: jest.fn(),
  send: jest.fn(),
};

const commands = {
  name: "commands",
  type: "GUILD_TEXT",
  delete: jest.fn(),
  send: jest.fn(),
};

client.guild.members.cache.set(1, teacher);
client.guild.members.cache.set(2, student);
client.guild.channels.cache.set(0, testCatecory);
client.guild.channels.cache.set(1, guideChannel);
client.guild.channels.cache.set(2, testChannel);
client.guild.channels.cache.set(3, testChannelGeneral);
client.guild.channels.cache.set(4, chat);
client.guild.channels.cache.set(5, testChannelAccouncement);
client.guild.channels.cache.set(6, commands);
client.guild.roles.cache.set(1, { name: "test" });
client.guild.roles.cache.set(2, { name: `${courseAdminRole}_test` });
client.guild.roles.cache.set(3, { name: "admin" });
client.guild.roles.cache.set(4, { name: facultyRole });
client.guild.members.cache.set(1, teacher);
client.guild.members.cache.set(2, student);
client.guild.members.cache.set(3, admin);

const defaultTeacherInteraction = {
  client: client,
  channelId: 1,
  member: {
    user: teacher,
    _roles: [1, 3, 4],
  },
  options: undefined,
  reply: jest.fn(),
};

const defaultStudentInteraction = {
  client: client,
  channelId: 2,
  member: {
    user: student,
    _roles: [1],
  },
  options: undefined,
  reply: jest.fn(),
};

const studentInteractionWithoutOptions = {
  client: client,
  channelId: 1,
  member: {
    user: {
      id: 2,
    },
  },
  options: undefined,
};

const defaultAdminInteraction = {
  client: client,
  channelId: 2,
  member: {
    user: admin,
    _roles: [2, 3],
    roles: [2, 3],
  },
  options: undefined,
  commandName: "test",
  reply: jest.fn(),
  editReply: jest.fn(),
};

module.exports = {
  adminData,
  adminData2,
  teacherData,
  teacherData2,
  studentData,
  studentJoinData,
  studentInsData,
  studentInteractionWithoutOptions,
  defaultTeacherInteraction,
  defaultStudentInteraction,
  defaultAdminInteraction,
};