# General

Enter a container:

`docker compose exec <container> bash`

# NestJS

# postgres

## Entering psql

Log into the database:

`psql --username=postgres`

List all commands:

`\?`

List all databases:

`\l`

Display connection info:

`\conninfo`

Connect to the `postgres` database:

`\c postgres`

Getting all users from the database:

`curl localhost:4242/api/users`

## Without entering psql

Print all databases:

`psql --username=postgres -l`

# nestjs

Start off by doing `cd containers`

## Regenerate the frontend and backend

We're using npx to directly execute these commands without installing them, since installing them globally with `npm install -g` gives permission denied errors, due to protected directories on our school's computers.

`npx @nestjs/cli new .`

`npx @vue/cli create client`

See [this tutorial](https://medium.com/js-dojo/how-to-serve-vue-with-nest-f23f10b33e1) on how to use nest.js together with vue.js

Make sure to remove the generated `.git` directory from it!

Also change the port in `src/main.ts` from 3000 to 4242.

## Add dependency

`npm install @nestjs/websockets`

## Remove dependency

`npm uninstall foo`
