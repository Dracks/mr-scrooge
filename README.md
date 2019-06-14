# Mr Scrooge
This is the base repository, to clone and start it using docker.

## Status
![https://travis-ci.org/Dracks/finances.svg?branch=master](https://travis-ci.org/Dracks/finances.svg?branch=master)


## Demo
You can run the docker image generated for the release inside her:
https://hub.docker.com/r/dracks/mrscrooge/

To run, execute the following command:
```
docker run --rm -p 3333:80 -e DEMODATA="true" dracks/mrscrooge:MVP
```

It will open your port 3333 with user demo/demo

You can set the following environment variables:
- DEMODATA: Default false. this will create a random data with tags and graphs
- DEMOUSER: default "demo". The username to create on the application
- DEMOPWD: default "demo". The password for the user

## Screenshots MVP
### Home
![Report in desktop](/docs/images/1-Desktop-Home.png)
[Report in mobile](/docs/images/1-Mobile-Home.png)
![Import in desktop](/docs/images/2-Desktop-Import.png)
![Tags in desktop](/docs/images/3-Desktop-Tags.png)
![Data in desktop](/docs/images/4-Desktop-Data.png)
[Data in mobile](/docs/images/4-Mobile-Data.png)

## Thanks
1. Marc Torrent: Who did a great introduction course to React in Privalia
2. VisualPharm: The author of my current Logo (CC Attribution-NoDerivs)


