# Todo Tasks
* rename class GocardlessInstitutionCredentials to gocardless_credentials
* handle correctly the credentials not found on accounts controller (and I expect all other endpoints)
* handle optionals correctly in:
  * AccountsAPI response
* Handle deleting of accounts if they are unselected
* Show the list of the current agreements, without needing to to create a new agreement
* Move the accounts management on the Accounts controller, and the institutions to the user-agreement (also rename user-agreement to institutions)
* Handle modifications of list with htmx
* Change the country filter to be a query parameter