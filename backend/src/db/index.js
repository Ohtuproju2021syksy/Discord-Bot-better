const { sequelize } = require("./dbInit");
const { logError } = require("./../discordBot/services/logger");
const Umzug = require("umzug");

const DB_CONNECTION_RETRY_LIMIT = 10;

const runMigrations = async () => {
  const migrator = new Umzug({
    storage: "sequelize",
    storageOptions: {
      sequelize,
      tableName: "migrations",
    },
    migrations: {
      params: [sequelize.getQueryInterface()],
      path: `${process.cwd()}/src/db/migrations`,
      pattern: /\.js$/,
    },
  });
  const migrations = await migrator.up();
  console.log("Ran the following migrations: ", {
    files: migrations.map((mig) => mig.file),
  });
};

const testConnection = async () => {
  await sequelize.authenticate();
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectToDatabase = async (attempt = 0) => {
  try {
    await testConnection();
    console.log("Connected to database");
    await sequelize.sync();
    try {
      await runMigrations();
    }
    catch (err) {
      logError(err);
      console.log("Failed to run migrations: \n " + err);
    }
  }
  catch (err) {
    logError(err);
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
  return null;
};

module.exports = {
  sequelize,
  connectToDatabase,
};
