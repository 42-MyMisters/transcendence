#!/bin/sh

nvm install --lts

npm i -g @nestjs/cli

## CONFIG
npm install config --save --prefix /data/back

## TYPEORM
npm install pg typeorm @nestjs/typeorm --save --prefix /data/back

## JWT, Passport
npm install @nestjs/jwt @nestjs/passport passport passport-jwt --save --prefix /data/back

## Class Validator
npm i --save class-validator class-transformer --prefix /data/back

npm run start:dev --prefix /data/back



