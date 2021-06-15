# CS DISCORD BOT

![Testing pipeline](https://github.com/CS-DISCORD-BOT/cs-discord-bot/actions/workflows/test.yml/badge.svg?branch=dev)[![codecov](https://codecov.io/gh/CS-DISCORD-BOT/cs-discord-bot/branch/dev/graph/badge.svg?token=qsZwyE4keT)](https://codecov.io/gh/CS-DISCORD-BOT/cs-discord-bot)[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Helsinki University software production project, summer 2021

This project implements a discord bot. Bot´s function is to aid students to find the right course channels in discord, where they can ask for help and communicate with other students.

## Documentation

[User manual (end user)](./documentation/usermanual.md)

[Project progress](./documentation/projectprogress.md)

[Developer links](./documentation/developerlinks.md)


## Instructions
Clone repository to your computer.

Install all dependencies `npm install`. 

Make your own discord bot. Instructions [here](./documentation/setupmainbot.md).

Add `.env` file to root of the repository (same directory with `package.json`).

Add following contents to `.env` file:
```
BOT_TOKEN=your-own-token
GUILD_ID=your-discord-server-id
PREFIX=!
```

To find the server id, follow instructions [here](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-) to enable developer mode and right click the server.

You have to have node installed


### Running bot in command line
Run one of following commands to start bot:
```
npm run dev (for development vesion)
npm start (for staging version)
```


### Running corde tests on command line
You will need another bot that sends the test commands. Follow the same instructions as [above](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot) to create another bot.

Add following contents to `.env` file:
```
CORDE_BOT_TOKEN=token-of-your-testing-bot-you-just-created
BOT_TEST_ID=id-of-your-bot-being-tested 
CHANNEL_ID=channel-for-the-tests
```

BOT_TEST_ID can be found as Application ID under General Information of your bot in [Discord Developer Portal](https://discord.com/developers/applications).  
CHANNEL_ID can be found by right clicking the channel after enabling developer mode.

Once you have [invited](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links) both of your bots to the server, run following command to run the corde tests:
```
npm run test:corde
```
