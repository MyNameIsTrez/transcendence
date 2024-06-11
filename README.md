# Transcendence

## How to run

1. Run `make`
2. Go to `localhost:2424` in your browser to view the website.

You can edit backend and frontend files without having to restart the server.

## Requirements

### Overview

- NestJS backend
- Use [Tailwind](https://tailwindcss.com/) + [daisyUI](https://daisyui.com/components/) to make components
- Use [Vite](https://vitejs.dev/guide/build) to send the frontend HTML/CSS/JS
- Use [socket.io](https://socket.io/docs/v4/client-api/) to connect players
- Use npm in the Makefile to install something like TypeORM, and use it to interact with Postgres
- TypeScript framework frontend
- PostgreSQL database
- Docker compose
- Single-page application means only sending the HTML/CSS/JS once, even if you change pages

### Security

- Chat and other passwords have to be hashed
- Protecting against SQL injections
- Server-side validation
- .env file

### User Account

- Instead of storing passwords, only allow logging in with Intra's OAuth API using [passport-42](https://www.passportjs.org/packages/passport-42/)
- Choosing unique name
- Uploading avatar
- 2FA
- Adding friends
- Seeing friends' online status
- Profile stats (wins/losses, ranking system, achievements)
- Match history

### Chat

- Chats that are public (optionally with a password)/private
- Direct messages
- Blocking users
- Chat owner
- Administrators
- Kicking, banning, muting
- Inviting to Pong game
- View other player profiles

### Game

- Pong
- Matchmaking system (just a queue, not necessarily ELO)
- Optional customization options

## Other links

- [42 API](https://api.intra.42.fr/apidoc/guides/getting_started)
- [nest.js example](https://github.com/nestjs/nest/blob/master/sample/02-gateways/src/events/events.gateway.ts)
- [nest.js gateways documentation](https://docs.nestjs.com/websockets/gateways)
