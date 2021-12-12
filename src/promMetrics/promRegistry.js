const promClient = require("prom-client");
const { joinedUsersCounter, bridgedMessagesCounter } = require("./promCounters");

const register = new promClient.Registry();
register.registerMetric(joinedUsersCounter);
register.registerMetric(bridgedMessagesCounter);

module.exports = register;
