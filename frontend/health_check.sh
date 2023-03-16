#!/bin/bash

if [ "`curl -I http://localhost:3000 2>/dev/null | head -n 1 | cut -d ' ' -f2`" == "200" ]; then
    exit 0
else
    exit 1
fi