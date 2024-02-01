FROM node

# Copy all files
COPY . /nestjs

# Install dependencies to node_modules,
# referring to package.json and package-lock.json
RUN npm ci --prefix=/nestjs

CMD [ "npm", "run", "start:dev", "--prefix=/nestjs" ]
