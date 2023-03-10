#!/bin/sh

nvm install --lts
npm install --prefix /data/front/

npm audit fix --force --prefix /data/front/

npm run start --prefix /data/front/
