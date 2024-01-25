FROM node

RUN mkdir -p /nestjs/app

# TODO: Can we make it so not everything is global without too much hassle?
WORKDIR /nestjs
RUN npm install @nestjs/cli @nestjs/websockets socket.io @nestjs/platform-socket.io socket.io-client
# RUN npm install --prefix /nestjs/app

COPY tools/startup.sh /home/startup.sh
CMD [ "/home/startup.sh" ]

EXPOSE 4242
