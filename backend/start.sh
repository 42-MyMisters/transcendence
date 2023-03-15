#!/bin/sh

nvm install --lts

npm i -g @nestjs/cli

## CONFIG
npm install config --save --prefix /data/back

## TYPEORM
npm install pg typeorm @nestjs/typeorm --save

## JWT, Passport
npm install @nestjs/jwt @nestjs/passport passport passport-jwt --save

## Class Validator
npm i --save class-validator class-transformer

npm run start:dev --prefix /data/back



