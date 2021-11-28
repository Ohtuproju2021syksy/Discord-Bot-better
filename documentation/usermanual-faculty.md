# User manual for faculty

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

### Authentication

To be able to use all the faculty commands, you need to authenticate yourself. Use command `/auth` and you receive an authentication link. Click the link and go through the verfication steps. Now you have the faculty role and you can use all the faculty commands.

### Creating a new course

You can create new course with command `/create_course`. Give the command and after that give the _course code_, course´s _full name_ and course´s _nickname_. Nickname is optional and if not given then the coursecode will be also course´s nickname. **Note** that nickname is the value that is used as course´s name that users see on the Discord´s left column. So, we prefer that you give your course a short nickname because it is more readable on Discord for the users. **Note** also that nickname is a unique value.

#### Multilingual course name

If your course has multilingual course name, enter all the information in the _full name_ field.

#### Open university course

If your course is an open university course, use the abbreviation **MOOC** in the _full name_ field next to your course name.

After the course is created there is an invitation link for the course on the course´s guide channel. Share this on the needed platforms, so the students can join this channel. Another option for joining is using the `/join` command.

### Create Telegram bridge

Today, many courses use Telegram discussion channels. At the moment there are students that might use only one of these platforms (Discord or Telegram). Therefore, we want to connect Discord and Telegram chat channels so everyone can see all the conversations. The following steps are made in Telegram.

#### Add our Telegram bot to your Telegram channel

Invite the **@cs-discord-bot** bot to your Telegram channel. First go to your channel. From the right top corner choose three dots and from the drop-down menu choose _Add members_.

Give the bot admin role (choose channel member and give the bot admin rights). You need to have an admin role to do this change. Under _What can this admin do?_ you must keep the **"Delete messages"** and **"Change group info"** settings on, but you can turn off all others.

#### Make the bridge

Create the connection between Discord and Telegram channels. Use command `/bridge <your Discord course name>` on your Telegram group. For example, to bridge the Telegram group `tkt-tito` to discord course `tito` use the command `/bridge tito` in the Telegram group.

Bot answers
```
Bridge created: Discord course <courseName> <--> Telegram course <telegramGroup>
```
if the bridge is created successfully.

If `course name` is invalid bot answers with message
```
Bridge not created: Invalid discord channel <courseName>
```
Note that only one Telegram group can be connected to only one Discord course.

### Delete the bridge

To delete existing bridge to a Telegram channel, use the command `/delete_bridge <your Discord course name>` on Discord. This will remove the bridge completely between the channels.

## How to create more text channels

The `/create_course` command automatically creates three sub-channels for the course. The sub-channels are: announcements (text channel), general (text channel) and one voice channel. To create more text channels for a course go inside the wanted course. Inside this course use `/create_channel` command followed by the desired text channel name to create new text channel.

Note that the channel name you give is the end part of the name. For example, in the picture new channel will be created with name _wepa_feedback_.

**Note also that if the course is bridged to telegram, messages from every channel will be bridged to telegram but messages from telegram are bridged only to general. If you want to disable bridge on a non-default text channel, use the command `/disable_bridge` on that channel.**

To remove added text channel use `/delete_channel` command followed by the name of the text channel to be removed e.g., `/delete_channel feedback` removes _wepa_feedback_. This command must also be used inside the course you want the channel to be removed. Note that announcements or general channels can not be removed.

## How to make course hidden
Once the course is created, it can be made hidden. This means joining the course channel is only possible via link. To make a secret course use the `/hide_course` command followed by the course name, e.g. `/hide_course wepa`. The secret courses can be identified by the ghost emoji. 

To make the course public again use the `/unhide_course` command followed by the course name, e.g. `/unhide_course wepa`. Public courses can be found with `/courses` command and with `/join` command, unlike secret courses.

## How to lock chat on course
Once the course is created, it can be locked. This means that only instructors and faculty can write in the course channels. This can be used e.g. when a course exam is on and you don't want students to post their answers. To lock_chat a course, use the `/lock_chat` command followed by the course name, e.g. `/lock_chat wepa`. The locked courses can be identified by the lock emoji.

To make the course unlocked again use the `/unlock_chat` command followed by the course name, e.g. `/unlock_chat wepa`.

## How to add instructors to a course
Students can use the `/instructors` command on a course and see all the instructors on that course. _Faculty_ members can give other users this course instructor role. To give instructor role to users, use `/add_instructors` command on a course channel. You can give the course instructor role to multiple people at once; e.g. `/add_instructors @user1 @user2`.

## How to remove instructors from a course
To remove instructor role from users, use `/remove_instructors` command on a course channel. You can remove the course instructor role from multiple people at once; e.g. `/remove_instructors @user1 @user2`.

## How to edit course name information

The `/edit_course` command allows you to edit the information for the course you are in. You can change the _course code_, _full name_ and _nickname_. If you change the value users see on the Discord´s left column, this value is either the course code or nickname depending on which values the course is based on, you have 15 minutes cooldown until you can use the command again.

## How to create or edit course channel topics

The `/edit_topic` command allows you to create or edit the information in the topic field of a channel. You can use this to customize channel appearance.

## How to create a poll

The `/create_poll` command allows you to create a poll that is placed in the same channel that you use the command in. It has 3 required arguments _title_, _duration_ and _answers_. Duration is given in minutes (14 minutes at most), for example "3" means 3 minutes. After the duration the poll closes automatically. _answers_ is the list of all possible answers to the poll, separated by " | ". For example "Java | Python" creates 2 answer options "Java" and "Python". Optional argument _description_ let's you create additional description for the poll, like additional instructions. You can close the poll manually by clicking the **Close Poll** -button that appears to the original `/create_poll` message. After the poll closes it shows the results, including how much each option was voted and which option/options got the most amount of votes.

## Disabling the bridge on a text channel

Users with faculty rights can disable the bridge between a certain course channel and Telegram. This can be used e.g. on off-topic course channels where there's a lot of discussion that could flood the Telegram chat with messages not directly related to the course. Note that the bridge can be disabled only on non-default channels, that is channels which were created individually with `/create_channel` after the course was created. You can check in which channels the bridge is disabled with the command `/status`. 

To enable the bridge on a channel, write the command `/enable_bridge` on that channel.

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
