# Telegram bridge

## Create your Telegram bot

Go to Telegram and search and join the channel **@botfather**. You can see all the commands byt typing _/start_.

Next type _/newbot_ and press enter. Follow the instructions given by **@botfather**. When the bot is ready, you should get this feedback:

![Telegram token](./images/telegramtoken.png)

Copy your token to `TELEGRAM_BOT_TOKEN` .env. Put your token value inside quotation marks. Set `TG_BRIDGE_ENABLED=true`.

## Add your bot to your channel

Invite your bot to your Telegram channel. First go to your channel. From the right top corner choose three dots and from the drop-down menu choose _Add members_. Search for your bot by its name, choose it and press _Add_.

Give your bot admin role (choose channel member and give your bot admin rights). You need to have an admin role to do this change. Under _What can this admin do?_ mark all the showing rights off.

## Make the bridge

To create a bridge between your Telegram channel and a Discourd course `courseName`, type `/bridge <courseName>` inside your Telegram channel. For example, to bridge your Telegram channel to the Discord course `tito`, type the following command in your Telegram channel: `/bridge tito`.

Bot answers
```
Bridge created: Discord course <courseName> <--> Telegram course <telegramGroup>
```
if bridge is created successfully.

If `courseName` is invalid bot answers with message
```
Bridge not created: Invalid discord channel <courseName>
```
