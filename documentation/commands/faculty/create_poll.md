## /create_poll

- :heavy_check_mark: Can be used in every channel.
- :heavy_check_mark: Reply with an ephemeral message - is only visible to the user of the interaction.
- :heavy_check_mark: Response includes the interaction status.
- :heavy_check_mark: Needs arguments.
- :x: All members can use this command.

Argument | Optional | Info
---------|----------|------ 
Title | :x: | Title of the question
Duration | :x: | Time (minutes) after which poll closes automatically
Answers | :x: | Answer options for the question, separated by " | " (e.g. answer1 | answer2 | answer3)
Description | :heavy_check_mark: | Optional additional description for the poll.