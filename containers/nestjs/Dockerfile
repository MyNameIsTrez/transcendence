FROM node

# Essentially a permanent `cd /nestjs`,
# even when `exec`ing into the container
WORKDIR /nestjs

# Copy all files in program/
COPY program/ ./

# Install dependencies to node_modules,
# referring to package.json and package-lock.json
RUN npm install

CMD [ "npm", "run", "start" ]
