const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");

let id = 1;
let roleId = 1;

const client = {
  commands: new Discord.Collection(),
  slashCommands: new Discord.Collection(),
  user: {
    id: 1,
  },
  guild: {
    me: {
      roles: ["admin"],
    },
    invites: {
      cache: [],
      fetch: jest.fn(() => client.guild.invites.cache),
    },
    channels: {
      cache: new Discord.Collection(),
      create: jest.fn((name, options) => client.guild.channels.cache.set(id, {
        name: name,
        type: options.type,
        send: jest.fn((content) => { return { content: content, pin: jest.fn() }; }),
        lastPinTimestamp: null,
        setName: jest.fn(),
        createInvite: jest.fn((courseName) => {
          client.guild.invites.cache.set(id, {
            name: courseName,
            code: 1,
          });
          id++;
        }),
        edit: jest.fn(),
      })),
      init: jest.fn(() => client.guild.channels.cache = new Discord.Collection()),
      messages: {
        cache: [],
        fetchPinned: jest.fn(() => []),
        send: jest.fn(),
      },
    },
    roles: {
      cache: new Discord.Collection(),
      create: jest.fn((data) => {
        client.guild.roles.cache.set(roleId, {
          name: data.name,
          id: data.id,
          members: data.members,
          delete: jest.fn(),
        }),
        roleId++;
      }),
      init: () => client.guild.roles.cache = new Discord.Collection(),
    },
    members: {
      cache: new Discord.Collection(),
      fetch: jest.fn(()=> { return client.guild.members.cache; }),
    },
  },
  guilds: {
    fetch: jest.fn(() => client.guild),
  },
  emit: jest.fn(),
};

const slashCommandsPath = path.resolve("src/discordBot/commands");

const slashCommandFolders = fs.readdirSync(slashCommandsPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);
for (const folder of slashCommandFolders) {
  const slashCommandFiles = fs.readdirSync(`${slashCommandsPath}/${folder}`).filter(file => file.endsWith(".js"));
  for (const file of slashCommandFiles) {
    const slashCommand = require(`${slashCommandsPath}/${folder}/${file}`);
    if (slashCommand.devOnly && process.env.NODE_ENV !== "development") continue;
    if (slashCommand.prefix) {
      client.commands.set(slashCommand.name, slashCommand);
    }
    else {
      client.slashCommands.set(slashCommand.data.name, slashCommand);
    }
  }
}

module.exports = {
  client,
};