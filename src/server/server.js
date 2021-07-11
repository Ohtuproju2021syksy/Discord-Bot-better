const makeApp = require("./app.js");
const PORT = process.env.PORT || 3001;

module.exports = (client) => {
  const app = makeApp(client);
  const server = app.listen(PORT, () => { console.log(`Server listening requests on port ${PORT}`); });
  return server;
};
