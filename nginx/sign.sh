#!/bin/sh

SSL_PATH=/etc/nginx/ssl

mkdir -p /var/www $SSL_PATH

chmod 700 -R $SSL_PATH 

openssl genrsa -out $SSL_PATH/transcendence.key 2048

openssl req -new \
        -key $SSL_PATH/transcendence.key \
        -out $SSL_PATH/transcendence.csr \
        -subj /C=KR/ST=Seoul/L=Seoul/O=42Seoul/OU=seseo/CN=transcendence/emailAddress=seseo@student.42seoul.kr

openssl x509 -req \
        -days 365 \
        -in $SSL_PATH/transcendence.csr \
        -signkey $SSL_PATH/transcendence.key \
        -out $SSL_PATH/transcendence.crt