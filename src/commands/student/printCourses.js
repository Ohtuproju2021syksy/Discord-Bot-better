const { getRoleFromCategory } = require("../../service");


const execute = (message) => {
  const guild = message.guild;

  const rows = guild.channels.cache
    .filter((ch) => ch.type === "category" && ch.name.startsWith("📚"))
    .map((ch) => {
      const courseFullName = ch.name.replace("📚", "").trim();
      const courseRole = getRoleFromCategory(ch.name);
      return `${courseFullName} - \`!join ${courseRole}\``;
    })
    .sort((a, b) => a.localeCompare(b));

  message.reply("\n" + rows.join("\n"));
};

module.exports = {
  name: "courses",
  description: "Prints out the courses to use with `!join` and `!leave`.",
  args: false,
  joinArgs: false,
  execute,
};
