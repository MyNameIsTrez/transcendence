FROM node

# Essentially a permanent `cd /nestjs`,
# even when `exec`ing into the container
WORKDIR /nestjs

# Copy all files in program/
COPY program/ ./

# Install dependencies to node_modules,
# referring to package.json and package-lock.json
# npm ci isn't allowed to mutate package-lock.json,
# as opposed to npm install, and is able to throw errors
RUN npm ci

CMD [ "npm", "run", "start:dev" ]
