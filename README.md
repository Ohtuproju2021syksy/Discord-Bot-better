# cs-discord-bot

![deployment pipeline](https://github.com/CS-DISCORD-BOT/cs-discord-bot/actions/workflows/deployment.yml/badge.svg)[![codecov](https://codecov.io/gh/CS-DISCORD-BOT/cs-discord-bot/branch/dev/graph/badge.svg?token=qsZwyE4keT)](https://codecov.io/gh/CS-DISCORD-BOT/cs-discord-bot)[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Instructions
Clone repository to your computer.

Make your own discord bot. Instructions for example [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot).  
Alternative guide for creating and inviting your bots can be found [here](https://www.freecodecamp.org/news/create-a-discord-bot-with-javascript-nodejs/).

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
You have to run following command once:
```
npm install
```

Run one of following commands to start bot:
```
npm run dev
npm run dev-new
npm start
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
