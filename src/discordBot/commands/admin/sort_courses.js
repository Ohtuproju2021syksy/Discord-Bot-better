const execute = async (message) => {
  if (message.member.permissions.has("ADMINISTRATOR")) {
    const guild = message.client.guild;

    let first = 9999;

    const result = guild.channels.cache
      .filter(c => c.type === "GUILD_CATEGORY" && (c.name.startsWith("📚") || c.name.startsWith("👻") || c.name.startsWith("🔐")))
      .map((c) => {
        const categoryName = c.name.split(" ")[1];
        if (first > c.position) first = c.position;
        return categoryName;
      }).sort((a, b) => a.localeCompare(b));

    let category;

    for (let index = 0; index < result.length; index++) {
      const courseString = result[index];
      category = guild.channels.cache.find(c => c.type === "GUILD_CATEGORY" && c.name.includes(courseString));
      await category.edit({ position: index + first });
    }
  }
};

module.exports = {
  prefix: true,
  name: "sort_courses",
  description: "Sort courses to alphabetical order.",
  role: "admin",
  usage: "!sort_courses",
  args: false,
  execute,
};
