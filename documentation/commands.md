### cs-discord-bot

### Admin commands

```
/deletecourse        Remove course channel given, e.g., /deletecourse ohpe
```

### Faculty commands

```
/createcourse         Creates course channel given, e.g., /create ohpe
/hidecourse           Makes the course private, disabling joining with /join, e.g., /hide ohpe
/createchannel     Adds a text channel for the course, e.g., /newchannel ohpe-questions
/deletechannel  Removes an added channel from the course, e.g., /removechannel ohpe-questions
/unhidecourse         Unhides a hidden course, making it public again, e.g., /unhide ohpe  
/editcourse  Change the name, code or nickname of a already existing course, e.g. /editcourse coursecode TKT10001
```

### Faculty commands
/addinstructor  Adds an instructor to the course, e.g., /addinstructor @user, used in a course channel.

### Commands for everyone

```
/auth           Gives you a link to click you can use to authenticate as faculty member.
/courses        Prints out all the available courses.
/help           Shows the list of available commands for your role.
/intructors     Prints out the instructors of the course, e.g., /instructors in a course channel or /instructors ohpe
/join           Adds you to the course given, e.g., /join ohpe
/leave          Removes you from the course given, e.g., /leave ohpe
```
