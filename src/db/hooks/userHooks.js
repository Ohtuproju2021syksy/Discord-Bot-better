const { facultyRole } = require("../../../config.json");

const initUserHooks = (guild, models) => {
  models.User.addHook("afterUpdate", async (user) => {
    const changedValue = user._changed;
    const userDiscoId = user.discordId;

    if (changedValue.has("admin")) {
      const adminRole = guild.roles.cache.find(r => r.name === "admin");
      const userDisco = guild.members.cache.get(userDiscoId);
      user.admin
        ? userDisco.roles.add(adminRole)
        : userDisco.roles.remove(adminRole);
    }

    if (changedValue.has("faculty")) {
      const facultyRoleObject = guild.roles.cache.find(r => r.name === facultyRole);
      const userDisco = guild.members.cache.get(userDiscoId);
      user.faculty
        ? userDisco.roles.add(facultyRoleObject)
        : userDisco.roles.remove(facultyRoleObject);
    }
  });
};

module.exports = { initUserHooks };