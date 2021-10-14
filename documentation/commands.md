### cs-discord-bot

### Admin commands

#### Note that admin commands must be run inside the _commands_ text channel.

Command | Description | Example
--- |--- | ---
`/deletecommand` | Delete the given slash command. | `/delete help`
`/deletecourse` | Delete the given course channel. | `/deletecourse ohpe`
`/reloadcommands` | Reload all slash commands, returning deleted commands, registering new commands, and updating command permissions. | `/reloadcommands`
`/sortcourses` | Sort courses alphabetically. | `/sortcourses`
`/updateinstructors` | Update course instructor roles. | `/updateinstructors`
`/updateinvlinks` | Update course invitation links. | `/updateinvlinks`

### Faculty commands

Command | Description | Example
--- |--- | ---
`/createchannel` | Add a text channel for the course. Must be used inside a course. | `/createchannel questions`
`/createcourse ` | Create a given course channel | `/createcourse ohpe ohjelmoinnin perusteet`
`/deletechannel` | Delete a text channel from the course. Must be used inside a course. | `/deletechannel questions`
`/disablebridge` | Disable bridge in a Discord text channel. Must be used inside a course and in a non-default text channel. | `/disablebridge`
`/editcourse` | Edit course information, e.g. course code, fullname, or nickname. Must be used inside a course. | `/editcourse nickname ohpe`
`/edittopic` | Edit course topic, replacing an already existing topic. | `/edittopic perusteet`
`/enablebridge` | Enable bridge in a Discord text channel. Must be used inside a course and in a non-default text channel. | `/enablebridge`
`/hidecourse` | Make the given course private, disabling joining with `/join` | `/hidecourse ohpe`
`/lock` | Lock the given course, disabling messaging by regular users | `/lock ohpe`
`/status` | Get full status of course. Must be used inside a course. | `/status`
`/unhidecourse` | Make the given course public, enabling joining with `/join`. | `/unhidecourse ohpe`
`/unlock` | Unlock the given course, enabling messaging by regular users. | `/unlock ohpe`

### Faculty commands

Command | Description | Example
--- |--- | ---
`/addinstructor` | Make the given user a course instructor for the current course. Must be used inside a course. | `/addinstructor @user`

### Commands for everyone

Command | Description | Example
--- |--- | ---
`/auth` | Gives you a link which you can use to authenticate as a faculty member. | `/auth`
`/courses` | Prints out all the available courses. | `/courses`
`/help` |  Lists available commands for your role. | `help`
`/help "command name"` | Shows information on the given command. | `/help courses`
`/intructors` | Lists the instructors of the course. Must be used inside a course. | `/instructors`
`/instructors "course name"` | Lists the instructors for the given course. | `/instructors ohpe`
`/join` | Join the given course. | `/join ohpe`
`/leave` | Leave the given course. | `/leave ohpe`