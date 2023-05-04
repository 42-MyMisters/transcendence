FROM nginx:latest

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./sign.sh /sign.sh

RUN chmod +x /sign.sh && /sign.sh

EXPOSE 443 80

STOPSIGNAL SIGKILL

