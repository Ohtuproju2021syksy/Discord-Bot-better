### cs-discord-bot

### Admin commands

#### Note that admin commands must be run inside the _#commands_ text channel.

Command | Description | Example
--- |--- | ---
`!add_admin_rights` | Add admin rights to given user (requires Discord ID of user). | `!add_admin_rights 123456789012345678`
`!delete_command` | Delete the given slash command. | `!delete help`
`!delete_course` | Delete the given course channel. | `!delete_course ohpe`
`!reload_commands` | Reload all slash commands, returning deleted commands, registering new commands, and updating command permissions. | `!reload_commands`
`!remove_admin_rights` | Remove admin rights from given user (requires Discord ID of user). | `!remove_admin_rights 123456789012345678`
`!remove_faculty_rights` | Remove faculty rights from given user (requires Discord ID of user). | `!remove_faculty_rights 123456789012345678`
`!sort_courses` | Sort courses alphabetically. | `!sort_courses`
`!update_instructors` | Update course instructor roles. | `!update_instructors`
`!update_invitelinks` | Update course invitation links. | `!update_invitelinks`

### Faculty commands

Command | Description | Example
--- |--- | ---
`/add_instructors` | Give instructor role to (multiple) users. | `/add_instructors @user1 @user2`
`/create_channel` | Add a text channel for the course. Must be used inside a course. | `/create_channel questions`
`/create_course ` | Create a given course channel | `/create_course ohpe ohjelmoinnin perusteet`
`/create_poll ` | Create a poll | `/create_poll Question 10 answer1 | answer 2 | answer 3`
`/delete_bridge` | Delete bridge from specified course | `/delete_bridge ohpe`
`/delete_channel` | Delete a text channel from the course. Must be used inside a course. | `/delete_channel questions`
`/disable_bridge` | Disable bridge in a Discord text channel. Must be used inside a course and in a non-default text channel. | `/disable_bridge`
`/edit_course` | Edit course information, e.g. course code, fullname, or nickname. Must be used inside a course. | `/edit_course nickname ohpe`
`/edit_topic` | Edit channel topic, replacing an already existing topic. | `/edit_topic perusteet`
`/enable_bridge` | Enable bridge in a Discord text channel. Must be used inside a course and in a non-default text channel. | `/enable_bridge`
`/hide_course` | Make the given course private, disabling joining with `/join` | `/hide_course ohpe`
`/lock_chat` | Lock the given course, disabling messaging by regular users | `/lock_chat ohpe`
`/status` | Get full status of course. Must be used inside a course. | `/status`
`/unhide_course` | Make the given course public, enabling joining with `/join`. | `/unhide_course ohpe`
`/unlock_chat` | Unlock the given course, enabling messaging by regular users. | `/unlock_chat ohpe`

### Commands for everyone

Command | Description | Example
--- |--- | ---
`/auth` | Gives you a link which you can use to authenticate as a faculty member. | `/auth`
`/courses` | Prints out all the available courses. | `/courses`
`/help` |  Lists available commands for your role. | `help`
`/help "command name"` | Shows information on the given command. | `/help courses`
`/intructors` | Lists the instructors of the course. Must be used inside a course. | `/instructors`
`/join` | Join the given course. After writing `/join`, the bot will give you a list of courses to choose from. | `/join`
`/leave` | Leave the given course. After writing `/leave`, the bot will give you a list of courses to choose from. | `/leave`