const fs = require("fs");
const slashCommands = {};

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

const initSlashCommands = (client) => {

  // const teacher = client.roles.cache.find(r => r.name === "teacher");
  // console.log(teacher);
  const slashCommandFolders = fs.readdirSync("./src/slash_commands/", { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const folder of slashCommandFolders) {
    const slashCommandFiles = fs.readdirSync(`./src/slash_commands/${folder}`).filter(file => file.endsWith(".js"));
    for (const file of slashCommandFiles) {
      const slashCommand = require(`./${folder}/${file}`);
      slashCommands[`${slashCommand.name}`] = slashCommand;
      client.api.applications(client.user.id).guilds(process.env.GUILD_ID).commands.post({
        data: {
          name: slashCommand.name,
          description: slashCommand.description,
          permissions: [
            {
              id: 1323123,
              type: 1,
              permission: true,
            },
          ],
          // possible options here e.g. options: [{...}]
        },
      });
    }
  }
};

module.exports = {
  sendEphemeral,
  initSlashCommands,
  slashCommands,
};