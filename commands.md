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

## Without entering psql

Print all databases:

`psql --username=postgres -l`
