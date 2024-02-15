FROM node

# Install dependencies to node_modules,
# referring to package.json and package-lock.json
COPY package.json package-lock.json /vuejs/
COPY src/assets/icons/user-icon.png /vuejs/icons/
RUN npm ci --prefix=/vuejs


RUN npm i --prefix=/vuejs vue-sidebar-menu
RUN npm i --prefix=/vuejs sass
# RUN npm i --prefix=/vuejs @fortawesome/fontawesome-svg-core
# RUN npm i --prefix=/vuejs @fortawesome/free-solid-svg-icons
# RUN npm i --prefix=/vuejs @fortawesome/vue-fontawesome


CMD npm run dev --prefix=vuejs/code
