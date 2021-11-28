# User manual for admin

### About Discord

To learn more about Discord in general, head over to their [official website](https://discord.com/). You can also check the [Beginner's Guide to Discord](https://support.discord.com/hc/en-us/articles/360045138571-Beginner-s-Guide-to-Discord#h_d33e3809-909b-4720-899d-db26c17bafa9).

The Department of Computer Science has a Discord server for course support. The server contains categories for courses where students can ask for help and offer peer support for other students. The server also has a bot that can help you with several things, including joining course channels, getting instructor info for a course, getting info on course workshops, and more.

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

Commands can be used by typing `/<command_name>` into the message area at the bottom of the application. You can see all the available commands as a list that opens after typing `/`. Admin commands are started with `!` instead of `/`. **Note that you have to manually type the commands; the bot rarely understands copy-pasted commands!**

**Note that admin commands must be used inside the _#commands_ text channel. The bot will react to your command with a green check mark if the command succeeded, or with a red cross if the command didn't succeed.**

### Getting admin rights/adding admin rights

Only other admins can grant admin rights. To grant admin rights, you can use `!add_admin_rights` inside the _#commands_ text channel. You must give the user's Discord id as a parameter; e.g. `!add_admin_rights <discord_id>`. You can copy the user's Discord id by right-clicking their name and choosing `Copy ID` from the dropdown menu.

### Removing admin rights

To remove admin rights from a user, use `!remove_admin_rights` inside the _#commands_ text channel. You must give the user's Discord id as a parameter; e.g. `!remove_admin_rights <discord_id>`. You can copy the user's Discord id by right-clicking their name and choosing `Copy ID` from the dropdown menu.

### Removing faculty rights

To remove faculty rights from a user, use `!remove_faculty_rights` inside the _#commands_ text channel. You must give the user's Discord id as a parameter; e.g. `!remove_faculty_rights <discord_id>`. You can copy the user's Discord id by right-clicking their name and choosing `Copy ID` from the dropdown menu.

### Deleting a slash command ###

If you want to delete a slash command, simply use `!delete_command <command name>` inside the _#commands_ text channel. Note that the command name must be given without the preceding slash, i.e. if you want to delete the `/add_instructors` command, you must type `!delete_command add_instructors`. Deleted commands can be reloaded with the `!reload_commands` command.

### Deleting a course ###

To delete a course, use `!delete_course <course name>` inside the _#commands_ text channel. You can either give the course name or course code as a parameter. The bot will ask for confirmation; if you want to continue, press the green "Confirm" button, otherwise, press the red "Decline" button. The bot will wait for your answer for one minute, after which it will automatically decline the request.

### Reloading commands ###

If you need to reload a deleted slash command, register a new command, or update command permissions, use `!reload_commands` inside the _#commands_ text channel.

### Sort courses ###

To sort courses alphabetically, use `!sort_courses` inside the _#commands_ text channel.

### Update instructors roles ###

To update course instructor roles, use `!update_instructors` inside the _#commands_ text channel.

### Update server and course intive links ###

To update server and course invite links, use `!update_invitelinks` inside the _#commands_ text channel.

### List of commands

#### Admin specific commands ####

Command | Explanation | Arguments
--------|-------------|----------:
[!add_admin_rights](./command/admin/add_admin_rights.md) | Add admin rights to a user. | :heavy_check_mark:
[!delete_command](./command/admin/delete_command.md) | Delete the given slash command. | :heavy_check_mark:
[!delete_course](./command/admin/delete_course.md) | Delete the given course channel. | :heavy_check_mark:
[!reload_commands](./command/admin/reload_commands.md) | Reload all slash commands, returning deleted commands, registering new commands, and updating command permissions. | :x:
[!remove_admin_rights](./command/admin/remove_admin_rights.md) | Remove admin rights from a user. | :heavy_check_mark:
[!remove_faculty_rights](./command/admin/remove_faculty_rights.md) | Remove faculty rights from a user. | :heavy_check_mark:
[!sort_courses](./command/admin/sort_courses.md) | Sort courses alphabetically. | :x:
[!update_instructors](./command/admin/update_instructors.md) | Update course instructor roles. | :x:
[!update_invitelinks](./command/admin/update_invitelinks.md) | Update course invitation links. | :x:

#### Faculty specific commands ####

Command | Explanation | Arguments
--------|-------------|----------:
[/add_instructors](./commands/faculty/add_instructors.md) | Give instructor role to (multiple) users, e.g., /add_instructors @user1 @user2. | :heavy_check_mark:
[/create_channel](./commands/faculty/create_channel.md) | Create new text channel inside a course, e.g., /create_channel feedback. | :heavy_check_mark:
[/create_course](./commands/faculty/create_course.md) | Create a new course | :heavy_check_mark:
[/create_poll](./commands/faculty/create_poll.md) | Create a new poll | :heavy_check_mark:
[/delete_bridge](./commands/faculty/delete_bridge.md) | Delete the bridge from specified Course, e.g., /delete_bridge ohpe | :heavy_check_mark:
[/delete_channel](./commands/faculty/delete_channel.md) | Remove given text channel inside a course, e.g., /delete_channel feedback. | :heavy_check_mark:
[/disable_bridge](./commands/faculty/disable_bridge.md) | Disable the bridge between Telegram and the (non-default) course channel it is used in. | :x:
[/edit_course](./commands/faculty/edit_course.md) | Edit course information, options; coursecode, full name, nickname | :heavy_check_mark:
[/edit_topic](./commands/faculty/edit_topic.md) | Edit topic, must be used in a course channel, e.g., /edit_topic A new topic. | :heavy_check_mark:
[/enable_bridge](./commands/faculty/enable_bridge.md) | Enable the bridge between Telegram and the (non-default) course channel it is used in. | :x:
[/hide_course](./commands/faculty/hide_course.md)| Make given course private, e.g., /hide_course weba. | :heavy_check_mark:
[/lock_chat](./commands/faculty/lock_chat.md) | Lock the chat (meaning only instructors and faculty can post messages) of a given course | :heavy_check_mark:
[/remove_instructors](./commands/faculty/remove_instructors.md) | Remove instructor role from (multiple) users, e.g., /remove_instructors @user1 @user2. | :heavy_check_mark:
[/status](./commands/faculty/status.md) | Used in course channel returns general info about the course | :heavy_check_mark:
[/unhide_course](./commands/faculty/unhide_course.md) | Make given course public, e.g., /unhide_course weba. | :heavy_check_mark:
[/unlock_chat](./commands/faculty/unlock_chat.md) | Unlock the chat of a given course | :heavy_check_mark:

#### General commands ####

Command | Explanation | Arguments
--------|-------------|----------:
[/auth](./commands/general/auth.md) | Returns the URL from which the faculty role can be obtained. | :x:
[/courses](./commands/general/courses.md) | Returns a list of all courses. | :x:
[/help](./commands/general/help.md) | Returns a list of commands with info or info about a specific command. | :o:
[/instructors](./commands/general/instructors.md) | Used in course channel returns a list of course instructors. Can be used anywhere when a parameter is given. | :o:
[/join](./commands/general/join.md) | Joins you into the course given, e.g., /join ohpe. | :heavy_check_mark:
[/leave](./commands/general/leave.md) | Remove you from the course given, e.g., /leave ohpe. | :heavy_check_mark:
[/workshops](./commands/general/workshops.md) | Get workshop info for the course. | :x:

:o: means that the command can be used with or without arguments

### Material

[Source code for the Bot](https://github.com/Ohtuproju2021syksy/Discord-Bot-better)