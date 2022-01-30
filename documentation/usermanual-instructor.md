# User manual for instructors

### About Discord

To learn more about Discord in general, head over to their [official website](https://discord.com/). You can also check the [Beginner's Guide to Discord](https://support.discord.com/hc/en-us/articles/360045138571-Beginner-s-Guide-to-Discord#h_d33e3809-909b-4720-899d-db26c17bafa9).

The Department of Computer Science has a Discord server for course support. The server contains categories for courses where students can ask for help and offer peer support for other students. The server also has a bot that can help you with several things, including creating course categories, adding instructors for a course, editing course visibility, and more.

We recommend that you use the Discord application (desktop app or mobile app). If you can't or don't want to download the application, you can use a browser-based version of Discord instead.

### Create your Discord account

Create yourself a Discord account. You can do this on [Discord Website](https://discord.com/). If you already have the account, you can login [here](https://discord.com/login).

If you’re on a desktop or mobile device, you can directly open the Discord app on your device (You can learn more information on downloading the app [here](https://support.discord.com/hc/en-us/articles/360033931551)).

Once you’re at the login page, type in either _your email address_ or _phone number_ that has been officially verified to your Discord account. 

Note: You will need to verify your phone number to your Discord account before using phone number login! [Click here](https://support.discord.com/hc/en-us/articles/360033931551) to learn how to verify your phone number to your Discord account.

### Joining to the Discord

You can join to the Helsinki University Discord server in two different ways. Join directly to the server using this [link]( https://study.cs.helsinki.fi/discord). Join directly using the course´s own link (MOOC, Moodle, etc.).

![commands](./images/courselink.png)

### How to use the bot

The Discord server has a bot that can help you with many things. Interaction with bot is achieved with Discord's slash commands.

Commands can be used by typing `/<command_name>` into the message area at the bottom of the application. You can see all the available commands as a list that opens after typing `/`. **Note that you have to manually type the commands; the bot rarely understands copy-pasted commands!**

### Disconnecting users from course voice chat

You can disconnect another user from course voice chat with the command `/instructor_disconnect`. Note that you can disconnect a user only if you are an instructor on that course. E.g. if you are a course instructor in tito, `@user1` is currently in `tito_voice`, and `@user2` is in `wepa_voice`, you can disconnect `@user1` by typing `/instructor_disconnect @user1` in any chat, whereas using `/instructor_disconnect @user2` will do nothing as you are not an instructor in wepa.

#### Instructor specific commands ####

Command | Explanation | Arguments
--------|-------------|----------:
[/instructor_disconnect](./commands/instructor/instructor_disconnect.md) | Disconnect another user from a voice chat, e.g., /instructor_disconnect @user1. Only works for persons in voice chat of a course you are instructor in. | :heavy_check_mark:

### General commands

Command | Explanation | Arguments
--------|-------------|----------:
[/auth](./commands/general/auth.md) | For faculty members with student role to acquire the faculty role. | :x:
[/courses](./commands/general/courses.md) | Get public course information | :x:
[/help](./commands/general/help.md) | Get help how to use slash commands. | :o:
[/instructors](./commands/general/instructors.md) | Get course intructors information. | :x:
[/join](./commands/general/join.md) | Joins you into the course given, e.g., /join ohpe. | :heavy_check_mark:
[/leave](./commands/general/leave.md) | Remove you from the course given, e.g., /leave ohpe. | :heavy_check_mark:
[/workshops](./commands/general/workshops.md) | Get workshop info for the course. | :x:

### Material

[Source code for the Bot](https://github.com/Ohtuproju2021syksy/Discord-Bot-better)