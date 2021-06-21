const fs = require("fs");
const { Client } = require("discord-slash-commands-client");

const slashCommands = {};

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

const initSlashCommands = async (client) => {
  // const commands = await slashClient.getCommands({ guildID: process.env.GUILD_ID });
  // console.log(commands);
  const commandUnderDev = "join";

  const slashCommandFolders = fs.readdirSync("./src/slash_commands/", { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const folder of slashCommandFolders) {
    const slashCommandFiles = fs.readdirSync(`./src/slash_commands/${folder}`).filter(file => file.endsWith(".js"));
    for (const file of slashCommandFiles) {
      const slashCommand = require(`./${folder}/${file}`);
      slashCommands[`${slashCommand.name}`] = slashCommand;

      if (slashCommand.name !== commandUnderDev) continue;

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
        console.log(error);
      }

    }
  }
};

module.exports = {
  sendEphemeral,
  initSlashCommands,
  slashCommands,
};