FROM node

# Install dependencies to node_modules
COPY package.json package-lock.json /vuejs/
RUN npm ci --prefix=/vuejs/

# Copy generated node_modules from container to host using volume, and execute npm run dev
CMD cp -ru /vuejs/node_modules/ /vuejs/code/node_modules/ && npm run dev --prefix=/vuejs/code/
