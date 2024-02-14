FROM node

# Install dependencies to node_modules,
# referring to package.json and package-lock.json
COPY package.json package-lock.json /nestjs/
RUN npm ci --prefix=/nestjs

# TODO: Not all of these files have to be copied
COPY .eslintrc.js .gitignore .prettierrc nest-cli.json tsconfig.build.json tsconfig.json /nestjs/

COPY src/ /nestjs/src/

CMD npm run start:dev --prefix=nestjs
