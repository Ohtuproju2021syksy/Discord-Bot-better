# OAuth2 guide

[Discord.js Guide - Basic Web Server](https://discordjs.guide/oauth2/#setting-up-a-basic-web-server)

## Client secret

Copy client secret from developer portal OAtuth2 section and set to env CLIENT_SECRET.

## Redirects

Set redirect to <backend_server_url>/discordAuth.

## Scopes

Select correct redirect url from drop down menu, indentify and guild.join scopes.
Copy scopes url and set to env DISCORD_REDIRECT_URL.

##

Add default discord server invite to env DISCORD_SERVER_INVITE.
Add session secret to env SESSION_SECRET and BACKEND_SERVER_URL to env