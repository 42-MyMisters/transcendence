#!/bin/sh

STATUS=$(curl -o /dev/null -w "%{http_code}" "http://localhost:4000")

if [ $STATUS -eq 200 ]; then
    exit 0
else
    exit 1
fi