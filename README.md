# Transcendence

## How to run

1. Open a terminal, and start the nest.js backend with `cd containers/nestjs/program && npm install && npm run start:dev`
2. Open another terminal next to it, and start the vue.js frontend with `cd containers/nestjs/program/client && npm install && npm run watch`
3. Go to `localhost:4242` in your browser to see the website. You can edit backend and frontend files without having to restart the server.

## Requirements

### Overview

- NestJS backend
- TypeScript framework frontend
- PostgreSQL database
- Docker compose

### Security

- Hashing passwords
- Protecting against SQL injections
- Server-side validation
- .env file

### User Account

- OAuth user login
- Choosing unique name
- Uploading avatar
- 2FA
- Adding friends
- Seeing friends' online status
- Profile stats (wins/losses, ranking system, achievements)
- Match history

### Chat

- Channels that are public (optionally with a password)/private
- Direct messages
- Blocking users
- Channel owner
- Administrators
- Kicking, banning, muting
- Inviting to Pong game
- View other player profiles

### Game

- Pong
- Matchmaking system
- Optional customization options
