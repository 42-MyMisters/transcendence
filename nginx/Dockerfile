FROM node:lts AS build_stage

RUN mkdir -p /data/front /scripts && \
    apt update && apt upgrade -y

RUN chmod +x -R /scripts

STOPSIGNAL SIGKILL

WORKDIR /data/front

COPY ./front .

RUN npm install
RUN npm run build


FROM nginx:latest

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./sign.sh /sign.sh

RUN chmod +x /sign.sh && /sign.sh

COPY --from=build_stage /data/front/build /var/www/html/

EXPOSE 443 8443 
#80

STOPSIGNAL SIGKILL

