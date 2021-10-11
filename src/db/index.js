const { sequelize } = require("./dbInit");
const Umzug = require("umzug");

const DB_CONNECTION_RETRY_LIMIT = 10;

const testConnection = async () => {
  await sequelize.authenticate();
};

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectToDatabase = async (attempt = 0) => {
  try {
    await testConnection();
    console.log("Connected to database");
    try {
      await runMigrations();
    }
    catch (err) {
      console.log("Failed to run migrations: \n " + err);
    }
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
