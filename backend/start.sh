#!/bin/sh

nvm install --lts

npm i -g @nestjs/cli

npm install /data/back --save

npm run start:dev --prefix /data/back


