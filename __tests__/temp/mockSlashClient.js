const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");

const client = {
  commands: new Discord.Collection(),
  slashCommands: new Discord.Collection(),
  user: {
    id: 1,
  },
  guild: {
    invites: {
      cache: [],
    },
    channels: {
      cache: [],
      create: jest.fn((name) => client.guild.channels.cache.push({
        name: name, type: "text",
        send: jest.fn((content) => { return { content: content, pin: jest.fn() }; }),
        lastPinTimestamp: null,
        createInvite: jest.fn(() => client.guild.invites.cache.push({
          name: name,
          code: 1,
        })),
      })),
      messages: {
        cache: [],
        fetchPinned: jest.fn(() => []),
        send: jest.fn(),
      },
    },
    roles: {
      cache: [],
      create: jest.fn((data) => client.guild.roles.cache.push({
        name: data.data.name,
      })),
    },
    fetchInvites: jest.fn(() => client.guild.invites.cache),
    members: {
      cache: new Discord.Collection(),
    },
  },
  guilds: {
    fetch: jest.fn(() => client.guild),
  },
};

const slashCommandsPath = path.resolve("src/discordBot/slash_commands");

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
      client.slashCommands.set(
        slashCommand.name,
        {
          command: slashCommand,
          file: `./${folder}/${file}`,
        },
      );
    }
  }
}

module.exports = {
  client,
};