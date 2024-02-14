FROM node

# Install dependencies to node_modules,
# referring to package.json and package-lock.json
COPY package.json package-lock.json /vuejs/
RUN npm ci --prefix=/vuejs

# TODO: Not all of these files have to be copied
COPY .eslintrc.cjs .gitignore .prettierrc.json env.d.ts index.html old_index.html pong.js tsconfig.app.json tsconfig.json tsconfig.node.json vite.config.ts /vuejs/

COPY public/ /vuejs/public/
COPY src/ /vuejs/src/

CMD npm run dev --prefix=vuejs
