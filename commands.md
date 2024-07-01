# General

Enter a container:

`docker compose exec <container> bash`

# NestJS

# postgres

## Entering psql

Enter the db container:

`docker compose exec db bash`

Log into the database:

`psql --username=foo --db=bar`

List all commands:

`\?`

List all databases:

`\l`

Display connection info:

`\conninfo`

Connect to the `postgres` database:

`\c postgres`

Show current users in database:

`SELECT * from "user";`

Getting all users from the database:

`curl localhost:4242/api/users`

Authorize with intra.
If you want to allow someone else to play with you, you'll need to change the `VITE_ADDRESS` in the .env file and the `redirect_uri` parameter in this URL to the address of your computer.
`https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-687341ddad62ca71f252d1088176c46c196e91ce842a42462761637728776f8a&redirect_uri=http%3A%2F%2Flocalhost%3A2424&response_type=code`

## 2fa commands

### user me

```
curl localhost:4242/api/user/me -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjkxNDE4LCJpc1R3b0ZhY3RvckF1dGhlbnRpY2F0aW9uRW5hYmxlZCI6dHJ1ZSwiaXNUd29GYWN0b3JBdXRoZW50aWNhdGVkIjp0cnVlLCJpYXQiOjE3MTYyOTM4ODQsImV4cCI6MTcxODg4NTg4NH0.LUZDhMxi5z1Q6GUA8tMJsSuT9dh1z-MhaR_hjwC38vc'
```

### /2fa/generate

```
curl localhost:4242/2fa/generate -X POST -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjkxNDE4LCJpc1R3b0ZhY3RvckF1dGhlbnRpY2F0aW9uRW5hYmxlZCI6dHJ1ZSwiaXNUd29GYWN0b3JBdXRoZW50aWNhdGVkIjp0cnVlLCJpYXQiOjE3MTYyOTM4ODQsImV4cCI6MTcxODg4NTg4NH0.LUZDhMxi5z1Q6GUA8tMJsSuT9dh1z-MhaR_hjwC38vc'
```

### /2fa/turn-on

```
curl localhost:4242/2fa/turn-on -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjkxNDE4LCJpc1R3b0ZhY3RvckF1dGhlbnRpY2F0aW9uRW5hYmxlZCI6dHJ1ZSwiaXNUd29GYWN0b3JBdXRoZW50aWNhdGVkIjp0cnVlLCJpYXQiOjE3MTYyOTM4ODQsImV4cCI6MTcxODg4NTg4NH0.LUZDhMxi5z1Q6GUA8tMJsSuT9dh1z-MhaR_hjwC38vc' -H 'Content-Type: application/json' -d '{"twoFactorAuthenticationCode": ""}'
```

### /2fa/authenticate

```
curl localhost:4242/2fa/authenticate -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjkxNDE4LCJpc1R3b0ZhY3RvckF1dGhlbnRpY2F0aW9uRW5hYmxlZCI6dHJ1ZSwiaXNUd29GYWN0b3JBdXRoZW50aWNhdGVkIjp0cnVlLCJpYXQiOjE3MTYyOTM4ODQsImV4cCI6MTcxODg4NTg4NH0.LUZDhMxi5z1Q6GUA8tMJsSuT9dh1z-MhaR_hjwC38vc' -H 'Content-Type: application/json' -d '{"twoFactorAuthenticationCode": ""}'
```

## Without entering psql

Print all databases:

`psql --username=foo --db=bar -l`

# nestjs

Start off by doing `cd containers`

## Regenerate the frontend and backend

We're using npx to directly execute these commands without installing them, since installing them globally with `npm install -g` gives permission denied errors, due to protected directories on our school's computers.

`npx @nestjs/cli new .`

`npm create vue@latest`

See [this tutorial](https://medium.com/js-dojo/how-to-serve-vue-with-nest-f23f10b33e1) on how to use nest.js together with vue.js

Make sure to remove the generated `.git` directory from it!

Also change the port in `src/main.ts` from 3000 to 4242.

## Add dependency

`npm install @nestjs/websockets`

## Remove dependency

`npm uninstall foo`

## Manual curl request

`curl localhost:4242/api/chat/create -d '{"name": "foo", "visibility": "PUBLIC", "password": "foo"}' -H "Content-Type: application/json" -H "Authorization: Bearer <insert jwt here>"`
