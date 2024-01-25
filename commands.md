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

## Regenerate program/

`npx @nestjs/cli@latest new program`

Make sure to remove the generated `.git` directory from it!

## Regenerate package.json and package-lock.json w/ nestjs

`npm install @nestjs/cli`

## Install additional dependency

`npm install cowsay`

## Remove dependency

`npm uninstall cowsay`
