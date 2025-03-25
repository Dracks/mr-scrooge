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

## Run it
- You can run it via [docker image](https://hub.docker.com/r/dracks/mrscrooge)
- Or have it run in cloning the code and building it, see [How to contribute](#How-to-contribute)

### Environment vars
No matter which environment you use, the server accepts the following environment vars

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_URL` | Connection string for the database | `sqlite://db.sqlite3` |
| `SQL_LOG_LEVEL` | Log level for SQL queries, one of: [trace, debug, info, notice, warning, error, critical] | `debug` (or `info` if debug mode) |
| `STATIC_PATH` | Path prefix for static asset downloads in frontend | `/` |
| `DECIMAL_COUNT` | Number of decimal places to show in frontend | `2` |
| `APP_DEBUG` | Enable debug mode features in the frontend | `false` (production), `true` (debug build) |
| `ENVIRONMENT` | Environment name shown in frontend footer | `development` |
| `LATENCY_ON_INVALID_PASSWORD` | Time in seconds to wait before responding to invalid login attempts | `2` |
| `MAX_LOGIN_ATTEMPTS` | Maximum number of failed login attempts before locking the user | `5` |
| `MAX_LOGIN_ATTEMPTS_PERIOD` | Time period in minutes during which failed login attempts are counted | `60` |

Environment vars available in the docker
| Variable | Description | Default |
|----------|-------------|---------|
| `DEMO` | Enable demo mode and user setup | `false` |
| `DEMO_USER` | Override the default username for the create user command | - |
| `DEMO_PWD` | Override the default password for the create user command | - |
| `DEMO_EMAIL` | Override the default email the create user command | - |
| `DEMO_DATA` | Generate sample data for demo user | `false` |

### Commands available in the server application

The server application has multiple commands to make the initial creation easy, and also maintainance

- `create_user`: it will create a user in the database
  - `-u`, `--username`: define a username
  - `-p`, `--password`: define the password
  - `-e`, `--email`: define the e-mail
  - `--admin`: sets the user as admin
  - `-g`, `--groupname`: defines the group name
  
- `demo_data`: generate basic graphs, labels and random movements
  - `-g`, `--group-owner-id`: defines the group owner id of the generated data

- `change_password`: Change the password of a user
  - `username`: the username of the user to change the password

  




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
1. Run the server, with swift:
```
swift run
```
2. Migrate the data:
```
# ServerDebug is a softlink, to reuse the build from the swift run
./serverDebug migrate
```
3. Create an admin user (by default will be demo:demo):
```
./serverDebug create_user --admin
```

### Run the server tests
Simply run the tests using swift:
```
swift test
```
### Run the view
1. Install dependencies
```
pnpm install
```

2. Build in watch mode
```
pnpm run start:dev
```


## Thanks
The current application icon is from VisualPharm
