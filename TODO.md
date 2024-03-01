# Before handing in

- [Remove](https://stackoverflow.com/a/52643437/13279557) .env from the git history, and add it to the .gitignore
- Replace generic `FROM debian:oldstable` with specific versions, to make sure the project won't break in the future
- Edit the 42 oauth API "Redirect URI" so that it doesn't only work on the computer Sander often sits behind
- Find some way to have the hardcoded ports in `docker-compose.yml`, since they are already being declared by `.env`
