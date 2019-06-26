# Mr Scrooge
This is the base repository, to clone and start it using docker.

## Status
![https://travis-ci.org/Dracks/mr-scrooge.svg?branch=master](https://travis-ci.org/Dracks/mr-scrooge.svg?branch=master)

## File formats suported
Currently this application supports the following bank file formats:

- Caixabanc Account and card Excel
- N26 CSV file
- MultiBank QIF File (Thanks to [Albert Sola](https://github.com/albertsola/))


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

## How to contribute

1. Fork the branch develop of the part you wish to contribute (mrscrooge-server or mrscrooge-view). 
2. Clone the server and the view repositories
3. Run it

### Run the server
1. Make sure you have python3 available in your machine
2. Install dependencies (Recomendable use of virtual env [tutorial sample](https://www.pythonforbeginners.com/basics/how-to-use-python-virtualenv)) with:
```pip install -r requirements.txt```
3. Run the tests
```./manage.py test```
4. Run the server
```./manage.py runserver```

### Run the view
1. Make sure you have node 8.0 or superior
2. Install dependencies:
```yarn```
or 
```npm install ```
3. Run the tests ```yarn test``` or ```npm test``` (It will run with a watcher, this means that don't stop after run the tests waiting for changes)
4. Run the project ```yarn start``` or ```npm start```

## Thanks
The current application icon is from VisualPharm 


