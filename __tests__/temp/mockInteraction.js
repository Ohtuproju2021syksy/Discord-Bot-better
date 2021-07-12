const { client } = require("./mockSlashClient");
const prefix = "/";

const teacherData = [];
teacherData.push("Here's a list of all my commands:");
teacherData.push(client.slashCommands.map(command => `${prefix}${command.command.name} - ${command.command.description}`).join("\n"));
teacherData.push(`\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`);

const studentData = [];
studentData.push("Here's a list of all my commands:");
studentData.push(client.slashCommands
  .filter(command => command.command.role !== "teacher")
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
    cache: [{ name: "teacher" }],
    add: jest.fn(),
    fetch: jest.fn(),
  },
};

const student = {
  nickname: "student",
  roles: {
    cache: [{ name: "student" }],
    add: jest.fn(),
    fetch: jest.fn(),
  },
};

client.guild.members.cache.set(1, teacher);
client.guild.members.cache.set(2, student);

const teacherInteractionHelp = {
  client: client,
  channel: {
    send: jest.fn(),
  },
  member: {
    user: {
      id: 1,
    },
  },
  react: jest.fn(),
  reply: jest.fn(),
  data: {
    options: false,
  },
};

const studentInteractionHelp = {
  client: client,
  channel: {
    send: jest.fn(),
  },
  member: {
    user: {
      id: 2,
    },
  },
  react: jest.fn(),
  reply: jest.fn(),
  data: {
    options: false,
  },
};

const invalidInteractionHelp = {
  client: client,
  channel: {
    send: jest.fn(),
  },
  member: {
    user: {
      id: 2,
    },
  },
  react: jest.fn(),
  reply: jest.fn(),
  data: {
    options: [{
      value: "invalid",
    }],
  },
};
const interactionHelpJoin = {
  client: client,
  channel: {
    send: jest.fn(),
  },
  member: {
    user: {
      id: 1,
    },
  },
  react: jest.fn(),
  reply: jest.fn(),
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


module.exports = {
  teacherData,
  studentData,
  teacherJoinData,
  studentInsData,
  teacherInteractionHelp,
  studentInteractionHelp,
  invalidInteractionHelp,
  interactionHelpJoin,
};