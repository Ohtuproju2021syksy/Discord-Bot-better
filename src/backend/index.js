const express = require("express");
const fetch = require("node-fetch");
const PORT = process.env.PORT;

const clientID = process.env.BOT_TEST_ID;
const clientSecret = process.env.CLIENT_SECRET;

const app = express();

app.get("/", async (request, response) => {
  const { code, state } = request.query;
  console.log(state);
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
      const userResult = await fetch("https://discord.com/api/users/@me", {
        headers: {
          authorization: `${oauthData.token_type} ${oauthData.access_token}`,
        },
      });
      const authedUser = await userResult.json();
      const { client } = require("../index");
      const courseRole = await client.guild.roles.cache.find(r => r.name === state);
      const member = await client.guild.members.fetch(authedUser.id);
      if (member) {
        await member.roles.add(courseRole);
      }
      else {
        client.guild.addMember(authedUser, { access_token: oauthData.access_token, roles: courseRole });
      }


      response.json({ courseRole, member });
      // TODO: Get inv link from pinned message from course announcements and redirect
      //       or inform user about course not existing in case it doesn't
    }
    catch (error) {
      // NOTE: An unauthorized token will not throw an error;
      // it will return a 401 Unauthorized response in the try block above
      console.error(error);
    }
  }
});

app.get("/:course", async ({ params }, response) => {
  const { course } = params;
  const redirect_uri =
    `https://discord.com/api/oauth2/authorize?client_id=843811409216274493&redirect_uri=http%3A%2F%2Flocalhost%3A53134&response_type=code&scope=identify&state=${course}`;
  response.redirect(redirect_uri);
});

app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));