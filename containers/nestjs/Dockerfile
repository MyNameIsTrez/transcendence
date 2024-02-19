FROM node

# Install dependencies to node_modules,
# referring to package-lock.json
COPY package.json package-lock.json /nestjs/
RUN npm ci --prefix=/nestjs/

CMD cp -r /nestjs/node_modules/ /nestjs/code/node_modules/ && npm run start:dev --prefix=/nestjs/code/
