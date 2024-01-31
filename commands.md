# NestJS

# postgres

## Entering psql

Log into the database:

`psql --username=postgres`

List all databases:

`\list` or `\l`

Connect to a database:

`\connect` or `\c`

## Without entering psql

Print all databases:

`psql --username=postgres -l`

# nestjs

Start off by doing `cd containers/nestjs`

## Steps to run locally

1. `cd containers/nestjs/program`
2. `npm install`
3. Manually run, with hot reloading: `npm run start:dev`
4. Open `localhost:4242` in your browser to view the website

## Regenerate program/

`npx @nestjs/cli@latest new program`

Make sure to remove the generated `.git` directory from it!

Also change the port in `src/main.ts` from 3000 to 4242.

## Install additional dependencies

`npm install @nestjs/websockets @nestjs/platform-socket.io`

## Remove dependency

`npm uninstall foo`
