const { getRoleFromCategory, context } = require("../../util");


const execute = async (message) => {
  const { guild } = context;
  const rows = await guild.channels.cache
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
  execute,
};
