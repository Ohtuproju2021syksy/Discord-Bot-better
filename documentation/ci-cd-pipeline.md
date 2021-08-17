## CI/CD Pipeline

Both development and production vesions are running on University of Helsinki's staging server in a docker container.
Watchtower running on the staging server watches for changes to the Docker Hub repository and in case there is an update, the container gets updated and restarted, launching a brand-new version of the bot.

### Continuous Integration (CI)

Generally, all code changes are made to dev branch with the exception of certain alternative/experimental approaches and hotfixes that have their own branches. Dev branches use [Testing pipeline workflow](../.github/workflows/test.yml): runs eslint, jest tests and updates the coverage report and [Publish Docker image](../.github/workflows/publish.yml). Workflows are executed sequentially in away that if the Testing pipeline workflow passes then a new version of staging docker image is pushed to DockerHub.

### Continuous Deployment (CD)

Deployment requires pull request from dev to main, pass the Testing pipeline workflow and be approved by one reviewer. After merging workflows run on main branch and a new version of production docker image is pushed to DockerHub.

In case something unwanted gets deployed, the bot can be reverted to an older version by simply re-running [a publish workflow](https://github.com/CS-DISCORD-BOT/cs-discord-bot/actions/workflows/publish.yml) of the desired version.

