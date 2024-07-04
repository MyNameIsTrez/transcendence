FROM node

# Install dependencies to node_modules
COPY package.json package-lock.json /nestjs/
RUN npm ci --prefix=/nestjs/

# Copy generated node_modules from container to host using volume, and execute npm run dev
CMD cp -ru /nestjs/node_modules/ /nestjs/code/node_modules/ && npm run start --prefix=/nestjs/code/
