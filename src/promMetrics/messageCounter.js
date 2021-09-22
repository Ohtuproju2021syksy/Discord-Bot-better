const client = require("prom-client");

const messageCounter = new client.Counter({
  name: "message_counter_total",
  help: "Keeps track of the number of sent messages on a channel",
  labelNames: ["channel"],
});

module.exports = messageCounter;