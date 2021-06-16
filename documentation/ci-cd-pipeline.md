## CI/CD Pipeline

### Continuous Integration (CI)

Generally all code changes are made to dev branch with the exception of certain alternative/experimental approaches that might have their own branches. Once changes are pushed to GitHub, [the testing workflow](../.github/workflows/test.yml) starts. It runs eslint, jest and [corde](https://github.com/cordejs/corde) tests and updates the coverage report. The tokens and IDs that corde requires are stored as GitHub secrets and the tests are run on separate test server on Discord.

### Continuous Deployment (CD)

The bot is running on Helsinki University's staging server in a docker container. Deployment happens by creating a pull request from dev to main branch which triggers the tests again. Once those have passed, one reviewer is needed before the branches can be merged. After merging, the tests run on main branch once again and after they have passed [the publish workflow](../.github/workflows/publish.yml) starts. Using GitHub secrets, it creates and pushes the image to DockerHub.

Watchtower running on the staging server watches for changes to the dockerhub repository and in case there is an update, the container gets pulled again and restarted, launching a brand new version of the bot.



