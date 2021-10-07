const { sequelize } = require("./dbInit");

const DB_CONNECTION_RETRY_LIMIT = 10;

const testConnection = async () => {
  await sequelize.authenticate();
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectToDatabase = async (attempt = 0) => {
  try {
    await testConnection();
  }
  catch (err) {
    if (attempt === DB_CONNECTION_RETRY_LIMIT) {
      console.log(`Connection to database failed after ${attempt} attempts`);
      return process.exit(1);
    }
    console.log(
      `Connection to database failed! Attempt ${attempt} of ${DB_CONNECTION_RETRY_LIMIT}`,
    );
    await sleep(5000);
    return connectToDatabase(attempt + 1);
  }
  sequelize.sync();
  return null;
};

module.exports = {
  sequelize,
  connectToDatabase,
};
