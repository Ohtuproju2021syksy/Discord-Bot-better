# CS DISCORD BOT

![Testing pipeline](https://github.com/CS-DISCORD-BOT/cs-discord-bot/actions/workflows/test.yml/badge.svg?branch=dev)[![codecov](https://codecov.io/gh/CS-DISCORD-BOT/cs-discord-bot/branch/dev/graph/badge.svg?token=qsZwyE4keT)](https://codecov.io/gh/CS-DISCORD-BOT/cs-discord-bot)[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Helsinki University software production project, summer 2021

This project implements a discord bot. Bot´s function is to aid students to find the right course channels in discord, where they can ask for help and communicate with other students.

## Documentation

[User manual (student)](./documentation/usermanual-student.md)

[User manual (faculty)](./documentation/usermanual-faculty.md)

[Project progress](./documentation/projectprogress.md)

[Developer links](./documentation/developerlinks.md)

[CI/CD Pipeline](./documentation/ci-cd-pipeline.md)


## Instructions
Clone repository to your computer.

Install all dependencies `npm install`.

Add `.env` file to root of the repository (same directory with `package.json`).

Add following contents to `.env` file:
```
PREFIX=!
BOT_TOKEN=your-own-token
GUILD_ID=your-discord-server-id
BOT_ID=id-of-your-bot
CLIENT_SECRET=your-client-secret
DISCORD_REDIRECT_URL=your-client-oauth2-redirect-url-with-identyfy-guilds.join
DISCORD_SERVER_INVITE=your-discord-server-invite
PORT=your-custom-backend-port
SESSION_SECRET=server-session-secret
BACKEND_SERVER_URL=backend-server-url-without-port
POSTGRES_USERNAME=your-postgres-username (postgres if not changed)
POSTGRES_PASSWORD=your-postgres-password
DB_HOST= (only if you are not using PostgreSQL locally)

# Bridge
DISCORD_BOT_TOKEN=discord-bridge-bot-token
TELEGRAM_BOT_TOKEN=telegram-bridge-bot-token
TG_BRIDGE_ENABLED=true
```

Setup config.json file:
```
courseAdminRole: course-admin-role-name
facultyRole: techer-role-name
```

Make your own Discord Server. You can find instructions [here](./documentation/discordserver.md).

Make your own Discord Bot. You can find instructions [here](./documentation/setupmainbot.md).

Download and install PostgreSQL [here](https://www.postgresql.org/download/)

More help for PostgreSQL (in Finnish) [here](https://hy-tsoha.github.io/materiaali/osa-2/#tietokannan-k%C3%A4ytt%C3%A4minen)

Setting up the backend [here](./documentation/OAuth2.md).

### Running bot in command line
Run one of following commands to start bot:
```
npm run dev (for development vesion)
npm start (for staging version)
```

```
npm run test (run all the tests)
```
