const promClient = require("prom-client");
const joinedUsersCounter = require("./joinedUsersCounter");

const register = new promClient.Registry();

const initPromRegistry = () => {
  register.registerMetric(joinedUsersCounter);
};

module.exports = {
  initPromRegistry,
  register,
};
