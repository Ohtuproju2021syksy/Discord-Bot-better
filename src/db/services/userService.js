const findUserByDiscordId = async (id, User) => {
  return await User.findOne({
    where:{
      discordId: id,
    },
  });
};

const findUserByDbId = async (id, User) => {
  return await User.findOne({
    where:{
      id: id,
    },
  });
};

const createUserToDatabase = async (discordId, username, User) => {
  const alreadyinuse = await findUserByDiscordId(discordId, User);
  if (!alreadyinuse) {
    return await User.create({ name: username, discordId: discordId });
  }
  return alreadyinuse;
};

const removeUserFromDb = async (discordId, User) => {
  const user = await findUserByDiscordId(discordId, User);
  if (user) {
    await User.destroy({
      where: {
        id: user.id,
      },
    });
  }
};

const saveFacultyRoleToDb = async (discordId, User) => {
  const user = await findUserByDiscordId(discordId, User);
  if (user) {
    await user.update({ faculty: true });
  }
};

module.exports = {
  findUserByDiscordId,
  createUserToDatabase,
  removeUserFromDb,
  saveFacultyRoleToDb,
  findUserByDbId };