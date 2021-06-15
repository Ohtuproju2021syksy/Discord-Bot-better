const { client } = require("../src/index.js");
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
  roles: {
    cache: {
      find: () => true,
    },
  },
};

const student = {
  roles: {
    cache: {
      find: () => false,
    },
  },
};

const teacherMessage = {
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

const studentMessage = {
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

const studentMessageHelpIns = {
  client: client,
  channel: {
    send: jest.fn(),
  },
  content: "!help instructors",
  author: {
    bot: false,
  },
  member: teacher,
  react: jest.fn(),
  reply: jest.fn(),
};

module.exports = {
  teacherData,
  studentData,
  teacherJoinData,
  studentInsData,
  teacherMessage,
  studentMessage,
  teacherMessageHelpJoin,
  studentMessageHelpIns,
};