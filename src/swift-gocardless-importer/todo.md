# Todo Tasks
* [ ] rename class GocardlessInstitutionCredentials to gocardless_credentials
* [ ] handle correctly the credentials not found on all controllers that require credentials, with a view telling first are needed the credentials
* [ ] handle when the token cannot be refreshed anymore in GoCardLess, to show an error, showing the expiration info, and requesting a re-login
* handle optionals correctly in:
  * AccountsAPI response
* [ ] Handle deleting of accounts if they are unselected
* [ ] Show the list of the current agreements, without needing to to create a new agreement
* [x] Move the accounts management on the Accounts controller, and the institutions to the user-agreement (also rename user-agreement to institutions)
* [ ] Handle modifications of list with htmx
* [x] Change the country filter to be a query parameter
* [ ] improve the Api config method
* [ ] Join together the list insitutions and list countries