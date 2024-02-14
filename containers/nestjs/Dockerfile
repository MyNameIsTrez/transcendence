FROM node

# Install dependencies to node_modules,
# referring to package.json and package-lock.json
COPY package.json package-lock.json /nestjs/
RUN npm ci --prefix=/nestjs

CMD npm run start:dev --prefix=nestjs/code
