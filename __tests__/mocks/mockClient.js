const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");

const commandsPath = path.resolve("src/discordBot/commands");

const client = {
  commands: new Discord.Collection(),
  user: {
    id: 1,
  },
  guild: {
    invites: {
      cache: [],
      fetch: jest.fn(() => client.guild.invites.cache),
    },
    channels: {
      cache: [],
      create: jest.fn((name) => client.guild.channels.cache.push({
        name: name, type: "GUILD_TEXT",
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
        name: data.name,
      })),
    },
    members: {
      cache: [],
      fetch: jest.fn(()=> { return client.guild.members.cache; }),
    },
  },
  emit: jest.fn(),
};

const commandFolders = fs.readdirSync(commandsPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`${commandsPath}/${folder}`).filter(file => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`${commandsPath}/${folder}/${file}`);
    client.commands.set(command.name, command);
  }
}

module.exports = {
  client,
};