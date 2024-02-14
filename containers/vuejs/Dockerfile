FROM node

# Install dependencies to node_modules,
# referring to package.json and package-lock.json
COPY package.json package-lock.json /vuejs/
RUN npm ci --prefix=/vuejs

COPY . /vuejs/

CMD npm run dev --prefix=vuejs
