#!/bin/bash

tag="finances:test"

docker build . -t $tag -f $1 

docker run -p 8080:8080 --rm -it $tag
#docker run --name finances -p 80:80 -p 8000:8000 $tag supervisord -n


docker rmi -f $tag