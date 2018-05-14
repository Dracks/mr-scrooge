#!/bin/sh

python3 /home/django/manage.py migrate
python3 /home/django/manage.py demouser

supervisord -n