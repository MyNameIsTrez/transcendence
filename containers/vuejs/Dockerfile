FROM node

# Install dependencies to node_modules,
# referring to package-lock.json
COPY package.json package-lock.json /vuejs/
RUN npm ci --prefix=/vuejs/

CMD cp -ru /vuejs/node_modules/ /vuejs/code/node_modules/ && npm run dev --prefix=/vuejs/code/
