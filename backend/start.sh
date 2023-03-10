#!/bin/sh

nvm install --lts

npm i -g @nestjs/cli

npm install config --save --prefix /data/back

npm run start:dev --prefix /data/back


