const promClient = require("prom-client");
const messageCounter = require("./messageCounter");
const joinedUsersCounter = require("./joinedUsersCounter");

const register = new promClient.Registry();

const initPromRegistry = () => {
  // promClient.collectDefaultMetrics({ register });
  register.registerMetric(messageCounter);
  register.registerMetric(joinedUsersCounter);
};

module.exports = {
  initPromRegistry,
  register,
};
