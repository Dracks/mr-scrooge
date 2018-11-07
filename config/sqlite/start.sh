#!/bin/sh

if [ "$DEMOUSER" = "" ]; then
    DEMOUSER="demo"
fi

if [ "$DEMOPWD" = "" ]; then
    DEMOPWD="demo"
fi

python3 /home/django/manage.py migrate
python3 /home/django/manage.py demouser -u $DEMOUSER -p $DEMOPWD

if [ "$DEMODATA" = "true" ]; then
    python3 /home/django/manage.py demodata -t -g
fi

supervisord -n