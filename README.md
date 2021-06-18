# CS DISCORD BOT

![Testing pipeline](https://github.com/CS-DISCORD-BOT/cs-discord-bot/actions/workflows/test.yml/badge.svg?branch=dev)[![codecov](https://codecov.io/gh/CS-DISCORD-BOT/cs-discord-bot/branch/dev/graph/badge.svg?token=qsZwyE4keT)](https://codecov.io/gh/CS-DISCORD-BOT/cs-discord-bot)[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Helsinki University software production project, summer 2021

This project implements a discord bot. Bot´s function is to aid students to find the right course channels in discord, where they can ask for help and communicate with other students.

## Documentation

[User manual (end user)](./documentation/usermanual.md)

[Project progress](./documentation/projectprogress.md)

[Developer links](./documentation/developerlinks.md)

[CI/CD Pipeline](./documentation/ci-cd-pipeline.md)


## Instructions
Clone repository to your computer.

Install all dependencies `npm install`.

Add `.env` file to root of the repository (same directory with `package.json`).

Add following contents to `.env` file:
```
BOT_TOKEN=your-own-token
GUILD_ID=your-discord-server-id
PREFIX=!
```

Make your own Discord Server. You can find instructions [here](./documentation/discordserver.md).

Make your own Discord Bot. You can find instructions [here](./documentation/setupmainbot.md).


### Running bot in command line
Run one of following commands to start bot:
```
npm run dev (for development vesion)
npm start (for staging version)
```


### Running corde tests on command line

Add following contents to `.env` file:
```
CORDE_BOT_TOKEN=token-of-your-testing-bot-you-just-created
BOT_TEST_ID=id-of-your-bot-being-tested 
CHANNEL_ID=channel-for-the-tests
```

Make your own Discord test Bot. You can find instructions [here](./documentation/setuptestbot.md).

Once you have setup both of your Bots to your server, run following command to run the tests:

```
npm run test (run all the tests)
npm run test:corde (run only the corde tests)
```
