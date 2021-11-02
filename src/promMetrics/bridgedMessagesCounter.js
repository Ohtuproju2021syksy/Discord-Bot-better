const client = require("prom-client");

const bridgedMessagesCounter = new client.Counter({
  name: "bridged_messages_total",
  help: "Keeps track of bridged messages",
  labelNames: ["origin", "course"],
});

module.exports = bridgedMessagesCounter;