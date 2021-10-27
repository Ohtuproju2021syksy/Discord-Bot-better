const findUserByDiscordId = async (id, User) => {
  return await User.findOne({
    where:{
      discordId: id,
    },
  });
};

const createUserToDatabase = async (discordId, username, User) => {
  const alreadyinuse = await User.findOne({
    where:{
      discordId: discordId,
    },
  });
  if (!alreadyinuse) {
    return await User.create({ name: username, discordId: discordId });
  }
  return alreadyinuse;
};

const removeUserFromDb = async (discordId, User) => {
  const user = await User.findOne({
    where:{
      discordId: discordId,
    },
  });
  if (user) {
    await User.destroy({
      where: {
        id: user.id,
      },
    });
  }
};

module.exports = { findUserByDiscordId, createUserToDatabase, removeUserFromDb };