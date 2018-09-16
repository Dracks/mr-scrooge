#!/bin/bash

docker run -v $(pwd)/view:/home/data -v $(pwd)/config:/home/scripts node:6-alpine /home/scripts/build-view.sh