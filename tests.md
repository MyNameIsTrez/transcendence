# api/chat/create

## ok

### public

Run:

`clear && curl http://localhost:4242/api/chat/create --header 'Authorization: Bearer <jwt here>' -d '{"name": "foo", "visibility": "PUBLIC", "password": "foo"}' -H 'Content-Type: application/json'`

Expected response:

`{"chat_id":"<id here>","name":"foo","users":[<intra id here>],"history":[],"visibility":"PUBLIC","hashed_password":"","owner":<intra id here>,"admins":[<intra id here>],"banned":[],"muted":[]}`

### protected

Run:

`clear && curl http://localhost:4242/api/chat/create --header 'Authorization: Bearer <jwt here>' -d '{"name": "foo", "visibility": "PROTECTED", "password": "foo"}' -H 'Content-Type: application/json'`

Expected response:

`{"chat_id":"<id here>","name":"foo","users":[<intra id here>],"history":[],"visibility":"PROTECTED","hashed_password":"foo","owner":<intra id here>,"admins":[<intra id here>],"banned":[],"muted":[]}`

### private

Run:

`clear && curl http://localhost:4242/api/chat/create --header 'Authorization: Bearer <jwt here>' -d '{"name": "foo", "visibility": "PRIVATE", "password": "foo"}' -H 'Content-Type: application/json'`

Expected response:

`{"chat_id":"<id here>","name":"foo","users":[<intra id here>],"history":[],"visibility":"PRIVATE","hashed_password":"","owner":<intra id here>,"admins":[<intra id here>],"banned":[],"muted":[]}`

## err

TODO:

1. name being empty
2. visiblity not being PUBLIC/PROTECTED/PRIVATE
3. password being empty

# api/chat/chats

## ok

Run:

`clear && curl http://localhost:4242/api/chat/chats --header 'Authorization: Bearer <jwt here>'`

Expected response:

`["uuid1","uuid2"]`

## err

impossible

# api/chat/name

## ok

Run:

`clear && curl http://localhost:4242/api/chat/name --header 'Authorization: Bearer <jwt here>' -d '{"chat_id": "<uuid returned from /api/chat/create>"}' -H 'Content-Type: application/json'`

Expected response:

`foo`

## err

### chat_id is not a uuid

`clear && curl http://localhost:4242/api/chat/name --header 'Authorization: Bearer <jwt here>' -d '{"chat_id": "foo"}' -H 'Content-Type: application/json'`

Expected response:

`{"message":["chat_id must be a UUID"],"error":"Bad Request","statusCode":400}`

# api/public/leaderboard

## ok

Run:

`clear && curl http://localhost:4242/api/public/leaderboard`

Expected response:

`{"sander":42,"victor":69}`

## err

impossible
