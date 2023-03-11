#!/bin/sh

nvm install --lts

npm i -g @nestjs/cli

## CONFIG
npm install config --save --prefix /data/back

## TYPEORM
npm install pg typeorm @nestjs/typeorm --save

npm run start:dev --prefix /data/back


