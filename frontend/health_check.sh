#!/bin/sh

STATUS=$(curl -o /dev/null -w "%{http_code}" "http://localhost:3000")

if [ $STATUS -eq 200 ]; then
    exit 0
else
    exit 1
fi