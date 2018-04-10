#!/bin/bash

tag="finances:test"

docker build . -t $tag -f config/sqlite/Dockerfile

#docker run -p 80:80 -p 8000:8000 -it $tag bash
docker run --name finances -p 80:80 -p 8000:8000 $tag supervisord -n

for container in $(docker ps --all | grep "$tag" | cut -d' ' -f1); do
    docker rm $container
done

echo "docker rmi -f $tag"