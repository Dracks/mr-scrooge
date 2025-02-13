# Docker compose samples
WIP: See https://github.com/Dracks/mr-scrooge/issues/62

## sqlite
Is the one of the sample in the documentation.

Features:
  * It creates the user demo with password demo
  * It creates random demo data
  * It creates two sample graphs
  * It creates two sample tags
  * Opens the port 3333
  * Uses sqlite as database


## postgres
Is a sample docker compose, more complex, with custom user and connection to a postgres

Features:
  * Connects to remote postgress server
  * Creates custom user "user" with password "pwd"
  * Opens the port 3333
  * Don't create anything