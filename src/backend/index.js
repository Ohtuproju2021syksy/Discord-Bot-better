require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const PORT = process.env.PORT;

const clientID = process.env.BOT_TEST_ID;
const clientSecret = process.env.CLIENT_SECRET;

const app = express();

app.get("/", async (request, response) => {
  const { code, state } = request.query;
  // console.log(state);
  if (code) {
    try {
      const oauthResult = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        body: new URLSearchParams({
          client_id: clientID,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: `http://localhost:${PORT}`,
          scope: "identify",
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const oauthData = await oauthResult.json();
      // console.log(oauthData);
      const accessToken = oauthData.access_token;
      const userResult = await fetch("https://discord.com/api/users/@me", {
        headers: {
          authorization: `${oauthData.token_type} ${accessToken}`,
        },
      });
      const authedUser = await userResult.json();
      // console.log(authedUser);

      const { client } = require("../index");
      const guild = await client.guilds.fetch(process.env.GUILD_ID);
      const courseRole = guild.roles.cache.find(r => r.name === state);
      if (!courseRole) response.json({ status: "invalid invite url" });
      const member = guild.members.cache.get(authedUser.id);
      if (member) {
        await member.roles.add(courseRole);
        response.redirect(process.env.DISCORD_SERVER_INVITE);
      }
      else {
        client.users.fetch(authedUser.id)
          .then((user) => guild.addMember(user, { accessToken, roles: [courseRole.id] }));
        response.redirect(process.env.DISCORD_SERVER_INVITE);
      }

      // response.json({ courseRole, member });
    }
    catch (error) {
      // NOTE: An unauthorized token will not throw an error;
      // it will return a 401 Unauthorized response in the try block above
      console.error(error);
    }
  }
  // response.json({ status: "authentication failed" });
});

app.get("/:course", async ({ params }, response) => {
  const { course } = params;
  const redirect_uri =
    `${process.env.DISCORD_REDIRECT_URL}&state=${course}`;
  response.redirect(redirect_uri);
});

app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));