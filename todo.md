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
* [ ] graphs
  * [ ] Fix ui
* [ ] Imports
  * [x] Fix ui
* [ ] Bank transactions
  * [x] Fix ui
* [ ] labels
  * [ ] Fix ui
* [x] rules engine
  * [x] Fix ui
* [ ] users
  * [ ] Fix ui


# Server tasks (swift)
* [x] Create enums in DB, and use the enums
* [ ] graphs
  * [x] Modify graph
  * [x] Create graph
  * [x] Add validations on the selected labels
* [ ] Imports
  * [x] Import caixa enginyers
  * [x] Import n26
  * [x] Import commerzbank
  * [ ] Import qif
  * [x] Crud api
  * [x] Call to apply rules
* [ ] Bank transactions
  * [x] get bank transactions data
  * [x] add/remove label
* [ ] labels
  * [x] get labels
  * [x] create label
  * [ ] modify label
* [ ] rules engine
  * [x] new transactions are applied with the rules engine
  * [x] CRUD
  * [ ] Apply Rule
* [x] import django data
* [ ] users
  * [x] login/logout
  * [ ] admin users
    * [x] list
    * [x] modify
    * [ ] create
    * [ ] delete
  * [x] edit my profile
  * [ ] Command to change the password
  * [ ] Reset my password
* [x] Move services to dependency injection (in the app or in the context)
