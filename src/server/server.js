const { client } = require("../index");
const makeApp = require("./app.js");
const app = makeApp(client);
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => { console.log(`Server listening requests on port ${PORT}`); });

module.exports = server;