### cs-discord-bot

### Admin commands

Command | Description | Example
--- |--- | ---
`/remove` | Remove the given course channel. | `/remove ohpe`

### Faculty commands

Command | Description | Example
--- |--- | ---
`/blockbridge` | Blocks bridge in a Discord text channel. Must be used inside a course and in a non-default text channel. | `/block`
`/create` | Create a given course channel | `/create ohpe ohjelmoinnin perusteet`
`/hide` | Make the given course private, disabling joining with `/join` | `/hide ohpe`
`/lock` | Lock the given course, disabling messaging by regular users | `/lock ohpe`
`/newchannel` | Add a text channel for the course. Must be used inside a course. | `/newchannel questions`
`/removechannel` | Remove a text channel from the course. Must be used inside a course. | `/removechannel questions`
`/unblockbridge` | Unblocks bridge in a Discord text channel. Must be used inside a course and in a non-default text channel. | `/unblock`
`/unhide` | Make the given course public, enabling joining with `/join`. | `/unhide ohpe`
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