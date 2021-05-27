const execute = (message, args) => {
  message.channel.send('join');
};

module.exports = {
  name: 'join',
  args: true,
  description: 'Join to the course. NOT IMPLEMENTED YET!',
  execute,
};
