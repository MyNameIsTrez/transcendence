#!/bin/bash

# This lets the script exit if any command fails
set -e


# TODO: Get this out of the if statement (and preferably into the Dockerfile) once it's not a volume anymore
# Tests if volume was already initialized
if [ -z "$(ls -A /nestjs/app)" ]; then
	echo "Found no existing files, creating NestJS environment..."
	rm -fr /nestjs/app
	npx nest new /nestjs/app --package-manager npm
	sed -i "s/await app.listen(3000);/await app.listen(4242);/" /nestjs/nestjs/app/src/main.ts
	# nest generate module socket
	# nest generate service socket/socket
else
	echo "Found files, continuing..."
fi

# Letting the user know the container is almost ready
echo "Starting up NestJS"

# Starting up the server
# Should not have to do run start:dev but had issues without it
npm run start:dev --prefix /nestjs/nestjs/app
