const execute = async (message) => {
  if (message.member.hasPermission("ADMINISTRATOR")) {
    const guild = message.client.guild;

    let first = 9999;

    const result = guild.channels.cache
      .filter(c => c.type === "category" && c.name.startsWith("📚"))
      .map((c) => {
        const categoryName = c.name;
        if (first > c.position) first = c.position;
        return categoryName;
      }).sort((a, b) => a.localeCompare(b));

    let category;

    for (let index = 0; index < result.length; index++) {
      const courseString = result[index];
      category = guild.channels.cache.find(c => c.type === "category" && c.name === courseString);
      await category.edit({ position: index + first });
    }
  }
};

module.exports = {
  prefix: true,
  name: "sort",
  description: "Sort courses to alphabetical order",
  role: "admin",
  usage: "",
  args: false,
  execute,
};
