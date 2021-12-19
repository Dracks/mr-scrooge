# Mr Scrooge Server
This is the view of the application [MrScrooge](https://github.com/Dracks/mr-scrooge/)

## Status
![https://travis-ci.org/Dracks/mr-scrooge-server.svg?branch=master](https://travis-ci.org/Dracks/mr-scrooge-server.svg?branch=master)

## To Develop
Install dependencies:
```
pip install -r requirements.txt
```

Create a settings file (finances/settings.py) which import all the contents from settings_base like the following:
```
from .settings_base import *

AUTH_PASSWORD_VALIDATORS = []

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True
```

Run the project:
```
./manage.py runserver 
```
