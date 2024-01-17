FROM debian:oldstable

RUN apt update -y && apt upgrade -y

COPY tools/hello.sh /home/hello.sh

CMD [ "/home/hello.sh" ]
