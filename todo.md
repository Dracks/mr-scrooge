# Ui tasks
* [x] Adapt docker to use the new ui
* [x] Add linting/prettier & fix
* [x] modify Github actions
* [x] Add Error handling on login
* [ ] Add Error handling on save graph
* [ ] Add Error handling on save tag
* [x] Add Edit profile page
* [ ] Filters of the tag, are saved automatically, but the tag requires a button (this should be all the same)
* [x] Add button to apply filters to old records (Maybe with some confirmation)
* [ ] Extract logger into a separat package (with a better Ui implementation)
* [ ] Add translations
* [ ] Save of a new graph is not redirecting to the edition of the graph once get the new id
* [x] Imports missing the import raw data to get the errors

# Server tasks (nestjs)
* [x] graphs
  * [x] Modify graph
  * [x] Create graph
  * [x] Add validations on the selected labels
* [ ] Imports
  * [ ] Import caixa enginyers
  * [x] Import n26
  * [x] Import commerzbank
  * [ ] Import qif
* [ ] Bank transactions
  * [ ] new transactions are applied with the rules engine
* [ ] labels
  * [ ] create label
  * [ ] modify label
* [ ] rules engine
* [ ] import django data

# Server tasks (swift)
* [ ] graphs
  * [ ] Modify graph
  * [x] Create graph
  * [x] Add validations on the selected labels
  * [ ] Fix daterange enum values in ui
* [ ] Imports
  * [ ] Import caixa enginyers
  * [ ] Import n26
  * [ ] Import commerzbank
  * [ ] Import qif
  * [ ] Call to apply rules
* [ ] Bank transactions
  * [x] get bank transactions data
* [ ] labels
  * [x] get labels
  * [ ] create label
  * [ ] modify label
* [ ] rules engine
  * [ ] new transactions are applied with the rules engine
* [ ] import django data
* [ ] users
  * [x] login/logout
  * [ ] admin users
  * [ ] edit my user
* [ ] Improve Expected errors in graphql
  * [ ] Add a handler of the graphql generic errors in client
