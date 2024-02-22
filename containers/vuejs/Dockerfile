FROM node

# Install dependencies to node_modules,
# referring to package-lock.json
COPY package.json package-lock.json /vuejs/
# The sleep 1 is unfortunately necessary in order
# to offset the npm ci of this image with the one
# from the nestjs image
# Without it, this npm command hangs
# until docker-compose times it out after 5 minutes
RUN sleep 1 && npm ci --prefix=/vuejs/

CMD cp -ru /vuejs/node_modules/ /vuejs/code/node_modules/ && npm run dev --prefix=/vuejs/code/
