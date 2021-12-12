const client = require("prom-client");

const joinedUsersCounter = new client.Counter({
  name: "joined_users_total",
  help: "Tracks the amount of joined users per course",
  labelNames: ["course"],
});

const bridgedMessagesCounter = new client.Counter({
  name: "bridged_messages_total",
  help: "Keeps track of bridged messages",
  labelNames: ["origin", "course"],
});

const resetCounters = () => {
  joinedUsersCounter.reset();
  bridgedMessagesCounter.reset();
};

module.exports = {
  joinedUsersCounter,
  bridgedMessagesCounter,
  resetCounters,
};

