FROM node

# Copy all files
COPY . /vuejs

# Install dependencies to node_modules,
# referring to package.json and package-lock.json
RUN npm ci --prefix=/vuejs

CMD [ "npm", "run", "dev", "--prefix=/vuejs" ]
