# Workflow guide

## Where we are?
---
- Check discord messages
- Check sprint taskboard
- Check new commits from repos

## Start working
---
- Tag a task
- Look for correct repo
- Coding
    - Before you start:
        - check repo + branch
        ```
        git checkout dev
        git pull
        ```
        - code
    - When you have finished:
        - run lint
        - run tests

- Update documentation?
    - check repo + branch
    - write
    - review
- Git
    - use git add -p
    - commit single logical change
    - use proper commit messages

- Task done
    - push dev branch
    - tag task done
    - new tasks in mind?

- Story done
    - push dev branch
    - Mark story "Done in Sprint" in product backlog

- End working
    - push dev branch
    - mark working hours

## Git workflow
---
- Go correct repo folder
    ```
    git checkout <branch>
    git pull
    ```
- Work
    ```
    git add -p
    git commit
    ```
- Ready to share to team?
    ```
    git push
    ```
- Ready to staging?
    ```
    git checkoout main
    git pull
    git merge <branch>
    git push
    ```

## Links
---
Branching, commits, etc. [Git Style Guide](https://github.com/agis/git-style-guide)

Markdown guide [Basic writing and formatting syntax](https://docs.github.com/en/github/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)

Discord bot [file structure](https://discordjs.guide/command-handling/#individual-command-files).

Testing with corde [cordejs](https://github.com/cordejs/corde)

Testing with jest [jestjs.io docs](https://jestjs.io/docs/getting-started)

JavaScript for Programmers [Course](http://nicholasjohnson.com/javascript/javascript-for-programmers/)