## Authentication

*(Note. make sure you have "API_SECRET" set in your .env file as it will act as the password for logging in)*

Authentication is done using a simple JSON web token setup. Accessing most of the resources (anything outside of general GET:s) will require you to login.
Logging in requires a POST request to "backend_url"/login with a password that matches API_SECRET. (Note. the token given after a successful login will only last for an hour).


## Resources


### Courses


* **GET** `backend_url/api/courses`

Returns a list of all public (not hidden) courses. Listed attributes are id, course code, full name, and nickname.


* **GET** `backend_url/api/courses/:id`

- params: id: id of the course

Returns course with given id, lists all attributes of that course.


* **POST** `backend_url/api/courses`

Creates a course with given parameters. Request.body must contain `courseCode`, `fullName` and `name` (nickname).


* **PUT** `backend_url/api/courses/:id`

- params: id: id of the course

Updates course with given value(s). Can be used to change any number of the stored values (code, fullName, name, locked and private).


* **DELETE** `backend_url/api/courses:id`

- params: id: id of the course

Removes course with given id and name. Note! request.body must contain the `name` of the course. 



### Channels


* **GET** `backend_url/api/channels`

Returns a list of all channels ordered by course code. Lists all attributes.


* **GET** `backend_url/api/channels/:id`

- params: id: id of the channel

Returns a channel with given id, lists all attributes.


* **GET** `backend_url/api/channels/ofCourse/:id`

- params: id: id of the course

Returns a list of all channels belonging to given course. Lists all attributes.


* **POST** `backend_url/api/channels/:id`

- params: id: id of the course

Creates a new text channel for the given course (similar to `/create_channel`). Request.body must contain channel name under `name`.


* **PUT** `backend_url/api/channels/:id`

- params: id: id of the channel

Updates channel with given value(s). Can be used to change `name`, `topic` and `bridged`.


* **DELETE** `backend_url/api/channels/:id`

- params: id: id of the channel

Removes channel with given id and name. Note! request.body must contain the `name` of the channel. (Hint, channel names are stored as "courseName_channelName").