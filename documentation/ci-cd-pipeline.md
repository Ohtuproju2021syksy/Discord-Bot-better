## CI/CD Pipeline

### Continuous Integration (CI)

Generally all code changes are made to dev branch with the exception of certain alternative/experimental approaches that might have their own branches. Once changes are pushed to GitHub, [the testing workflow](../.github/workflows/test.yml) starts. It runs eslint, jest and [corde](https://github.com/cordejs/corde) tests and updates the coverage report. The tokens and IDs that corde requires are stored as GitHub secrets and the tests are run on separate test server on Discord. Once the tests have passed on dev branch, a new version of staging docker image is pushed to DockerHub.

### Continuous Deployment (CD)

The bot is running on University of Helsinki's staging server in a docker container. Deployment happens by creating a pull request from dev to main branch which triggers the tests again. Once those have passed, one reviewer is needed before the branches can be merged. After merging, the tests run on main branch once again and after they have passed [the publish workflow](../.github/workflows/publish.yml) starts. Using GitHub secrets, it creates and pushes the image to DockerHub.

Watchtower running on the staging server watches for changes to the Docker Hub repository and in case there is an update, the container gets pulled again and restarted, launching a brand new version of the bot.

In case something unwanted gets deployed, the bot can be reverted back to an older version by simply re-running [a publish workflow](https://github.com/CS-DISCORD-BOT/cs-discord-bot/actions/workflows/publish.yml) of the desired version.

