# Setup for the backend

## OAuth2 guide

[Discord.js Guide - Basic Web Server](https://discordjs.guide/oauth2/#setting-up-a-basic-web-server)

Go to the [developers application page](https://discord.com/developers/applications) and follow these instructions.

Select your application and go to "OAuth2" tab.

### Client secret

Copy client secret from developer portal OAtuth section and set to .env `CLIENT_SECRET`.

![Application button](./images/backend.png)

### Redirects

Set redirect to <server_url>/discordAuth.

### Scopes

Select correct redirect url from drop down menu. From the scopes select **indentify** and **guild.join**.
Copy scopes url and set to .env `DISCORD_REDIRECT_URL`.

From Discord add your default discord server invite to .env `DISCORD_SERVER_INVITE`.

### Session secret

Something here

### Backend server url

Something here