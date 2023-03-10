FROM node:14

RUN mkdir -p /data /scripts && \
    apt update && apt upgrade -y

ADD https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh /scripts/install.sh
COPY ./start.sh /scripts/start.sh
COPY ./health_check.sh /scripts/health_check.sh

RUN chmod +x -R /scripts && \
    /scripts/install.sh

EXPOSE 3000

STOPSIGNAL SIGKILL

ENTRYPOINT /scripts/start.sh

HEALTHCHECK --interval=3s --timeout=5s --start-period=5s --retries=10 CMD /scripts/health_check.sh