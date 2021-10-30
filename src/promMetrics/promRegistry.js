const promClient = require("prom-client");
const bridgedMessagesCounter = require("./bridgedMessagesCounter");
const joinedUsersCounter = require("./joinedUsersCounter");

const register = new promClient.Registry();
register.registerMetric(joinedUsersCounter);
register.registerMetric(bridgedMessagesCounter);

module.exports = register;
