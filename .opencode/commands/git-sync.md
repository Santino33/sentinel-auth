---description: Git sync - add, commit, pull, and push---
Perform a git sync operation: stage all changes, commit them, pull from the current branch, and push to the same branch.

Use this commit message: $ARGUMENTS (if no message provided, use "Update changes")

Execute these steps in order:
1. Run git status to see current changes
2. Run git diff to see the changes
3. Run git log to see recent commit messages for style reference
4. Stage all changes with git add .
5. Create commit with the specified message
6. Pull from current branch with git pull
7. Push to current branch with git push
