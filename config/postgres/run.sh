#!/bin/sh

python /home/server/manage.py migrate
/usr/sbin/uwsgi --ini /home/server/uwsgi.ini:local