FROM node:lts

RUN mkdir -p /data /scripts && \
    apt update && apt upgrade -y

COPY ./health_check.sh /scripts/health_check.sh

RUN chmod +x -R /scripts

EXPOSE 3000

STOPSIGNAL SIGKILL

WORKDIR /data/front

ENTRYPOINT npm i && npm run start

HEALTHCHECK --interval=3s --timeout=5s --start-period=5s --retries=10 CMD /scripts/health_check.sh