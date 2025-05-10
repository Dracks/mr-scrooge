#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <branch>"
    exit 1
fi

BRANCH=$1
git fetch origin
git checkout $BRANCH
git reset --hard origin/$BRANCH