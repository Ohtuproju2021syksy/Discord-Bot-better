const promClient = require("prom-client");
const joinedUsersCounter = require("./joinedUsersCounter");

const register = new promClient.Registry();
register.registerMetric(joinedUsersCounter);

module.exports = register;
