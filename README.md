# Mr Scrooge
This is the base repository, to clone and start it using docker.

[![CodeFactor](https://www.codefactor.io/repository/github/dracks/mr-scrooge/badge)](https://www.codefactor.io/repository/github/dracks/mr-scrooge)

## File formats suported
Currently this application supports the following bank file formats:

- Caixa Enginyers Account and Credit Card
- Commerce bank
- N26 CSV file
- MultiBank QIF File (TBD)

## Demo

## How to Migrate from Mr Scrooge V2
The migration from Django to Vapor brought significant database improvements, including group data ownership capabilities that enable multiple users to operate on a single instance. This upgrade requires a complete data migration from the previous database version.

1. Set up a new database for the upgraded version
2. Update your environment or .env file with the new database connection details  
3. Generate a new user via the "demo_user" command
4. Execute the data migration using v2_migrate along with the group ID for the user you wish, the command demo_user automatically provides you a group Id:
```
./server v2_migrate sqlite://db.sqlite 1234-1234-1234-1234
```

** IMPORTANT **: The web-client must have been launched and logged into at least once in V2 before graphs can be imported

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


### Run the view

## Thanks
The current application icon is from VisualPharm
