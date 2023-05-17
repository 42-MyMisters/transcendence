FROM node:lts

RUN mkdir -p /data /scripts && \
    apt update && apt upgrade -y && apt install postgresql-client -y

COPY ./health_check.sh /scripts/health_check.sh
COPY ./dummy.sql /dummy.sql

RUN chmod +x -R /scripts

EXPOSE 4000

STOPSIGNAL SIGKILL

WORKDIR /data/back

ENTRYPOINT npm i && npm run start:rel

CMD sleep 90 && psql < /dummy.sql

HEALTHCHECK --interval=3s --timeout=5s --start-period=5s --retries=10 CMD /scripts/health_check.sh