require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const PORT = process.env.PORT || 3001;

const clientID = process.env.BOT_TEST_ID;
const clientSecret = process.env.CLIENT_SECRET;

const app = express();

app.get("/", (request, response) => {
  response.status(200).send("OK");
});

app.get("/discordAuth", async (request, response) => {
  const { code, state } = request.query;
  if (code) {
    try {
      const oauthResult = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        body: new URLSearchParams({
          client_id: clientID,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: `http://localhost:${PORT}/discordAuth`,
          scope: "identify",
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const oauthData = await oauthResult.json();
      const accessToken = oauthData.access_token;
      const userResult = await fetch("https://discord.com/api/users/@me", {
        headers: {
          authorization: `${oauthData.token_type} ${accessToken}`,
        },
      });
      const authedUser = await userResult.json();
      const { client } = require("../index");
      const guild = await client.guilds.fetch(process.env.GUILD_ID);
      const courseRole = guild.roles.cache.find(r => r.name === state);
      const member = guild.members.cache.get(authedUser.id);
      if (member) {
        await member.roles.add(courseRole);
      }
      else {
        client.users.fetch(authedUser.id)
          .then((user) => guild.addMember(user, { accessToken, roles: [courseRole.id] }));
      }
      response.redirect(process.env.DISCORD_SERVER_INVITE);
    }
    catch (error) {
      console.error(error);
    }
  }
  else {
    response.status(401).send("Unauthorized client");
  }
});

app.get("/invite/:course", async ({ params }, response) => {
  const { course } = params;
  const { client } = require("../index");
  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const courseRole = guild.roles.cache.find(r => r.name === course);
  if (courseRole) {
    const redirect_uri =
    `${process.env.DISCORD_REDIRECT_URL}&state=${course}`;
    response.redirect(redirect_uri);
  }
  else {
    response.status(400).send("Bad Request");
  }
});

app.all("*", (request, response) => {
  response.redirect("/");
});

const server = app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));

module.exports = server;