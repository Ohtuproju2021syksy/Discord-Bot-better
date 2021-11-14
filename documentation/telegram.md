# Telegram bridge

## Create your Telegram bot

Go to Telegram and search and find the user **@botfather**. You can see all the commands byt typing  `/start`.

Next type `/newbot` and press enter. Give your bot a name, it must end in `bot`. Your bot is now ready, and you should get this feedback:

![Telegram token](./images/telegramtoken.png)

Copy your token to `TELEGRAM_BOT_TOKEN` .env. Put your token value inside quotation marks. Set `TG_BRIDGE_ENABLED=true`.

## Add your bot to your group

Invite your bot to your Telegram group. First go to your group. From the right top corner choose three dots and from the drop-down menu choose `Add members`. Search for your bot by its name and press add.

Give your bot admin role (you need to have an admin role to do this). From the three dots, choose `Manage group`. Choose `Administrators` and then `Add administrator`. 
From there, choose your bot. Under `What can this admin do?` mark all the rights off (some rights are locked to on, these are necessary).

## Make the bridge

On your telegram group that you want to bridge to discord course `courseName` send command `/bridge <courseName>`.
For example, to bridge telegram group `tkt-tito` to discord course `tito` use command `/bridge tito` in telegram group.

Bot answers
```
Bridge created: Discord course <courseName> <--> Telegram course <telegramGroup>
```
if bridge is created successfully.

If `courseName` is invalid bot answers with message
```
Bridge not created: Invalid discord channel <courseName>
```
if the course is bridged already bot will answer with message
```
Bridge not created: this course <courseName> has bridge already
```

### Delete the bridge

If you want to delete the bridge between Discord course and Telegram group, you can do so by using `/delete_bridge <courseName>` command in Discord.

If the deletion is succesfull the bot will answer with message
```
Deleted Telegram bridge from course: <courseName>
```