const fs = require("fs");
const { Client } = require("discord-slash-commands-client");
const { Collection } = require("discord.js");

const slashClient = new Client(
  process.env.BOT_TOKEN,
  process.env.BOT_TEST_ID,
);

const sendEphemeral = (client, interaction, content) => {
  client.api.interactions(interaction.id, interaction.token).callback.post({
    data: {
      type: 4,
      data: {
        content,
        // make the response ephemeral
        flags: 64,
      },
    },
  });
};

const createCommandRolePermissions = (client, highestRole) => {
  const allRoles = highestRole === "teacher" ? ["admin", "teacher"] : ["admin"];
  const permissions = [];

  allRoles.forEach(role => {
    const roleID = client.guild.roles.cache.find(r => r.name === role).id;
    permissions.push(
      {
        id: roleID,
        type: 1,
        permission: true,
      },
    );
  });

  return permissions;
};

const createSlashCommand = async (client, slashCommand) => {
  try {
    const createdCommand = await slashClient
      .createCommand({
        name: slashCommand.name,
        description: slashCommand.description,
        guildId: process.env.GUILD_ID,
        // disable the command for everyone if there's a role defined
        default_permission: !slashCommand.role,
        options: slashCommand.options,
      }, process.env.GUILD_ID,
      );
    if (slashCommand.role) {
      const permissions = createCommandRolePermissions(client, slashCommand.role);
      slashClient.editCommandPermissions(permissions, client.guild.id, createdCommand.id);
    }
  }
  catch (error) {
    // slashCommand.options && console.log(error);
  }
};

const loadCommands = (client) => {
  const slashCommands = new Collection();
  const slashCommandFolders = fs.readdirSync("./src/slash_commands/", { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  for (const folder of slashCommandFolders) {
    const slashCommandFiles = fs.readdirSync(`./src/slash_commands/${folder}`).filter(file => file.endsWith(".js"));
    for (const file of slashCommandFiles) {
      const slashCommand = require(`./${folder}/${file}`);
      if (slashCommand.devOnly && process.env.NODE_ENV !== "development") continue;
      slashCommands.set(
        slashCommand.name,
        {
          command: slashCommand,
          file: `./${folder}/${file}`,
        },
      );
    }
  }
  client.slashCommands = slashCommands;
  return slashCommands;
};

const reloadCommands = async (client, commandNames) => {
  commandNames.forEach((commandName) => {
    const { file } = client.slashCommands.get(commandName);
    delete require.cache[require.resolve(file)];
    const reloadedCommand = require(file);
    client.slashCommands.set(
      commandName,
      {
        command: reloadedCommand,
        file,
      },
    );
    createSlashCommand(client, reloadedCommand);
  });
};

const createSlashCommands = async (client) => {
  const slashCommands = loadCommands(client);
  slashCommands.forEach((slashCommand) => {
    createSlashCommand(client, slashCommand.command);
  });
};

module.exports = {
  sendEphemeral,
  createSlashCommands,
  reloadCommands,
};
