# copy from https://github.com/dockerfiles/django-uwsgi-nginx

# FROM python:3.8-slim-bullseye
FROM python:3.8-slim-bullseye

#MAINTAINER Dockerfiles

# Install required packages and remove the apt packages cache when done.
RUN apt-get update
RUN apt-get install -y \
		nginx \
		supervisor \
		build-essential \
		python-dev \
		sqlite3 && \
	rm -rf /var/lib/apt/lists/*

RUN pip install uwsgi

# add (the rest of) our code
COPY server /home/django/

RUN pip3 install -r /home/django/requirements.txt
COPY docker/config/sqlite/settings.py /home/django/finances
RUN (cd /home/django;python3 manage.py collectstatic)

# setup all the configfiles
RUN echo "daemon off;" >> /etc/nginx/nginx.conf
COPY docker/config/sqlite/nginx.conf /etc/nginx/sites-available/default
COPY docker/config/sqlite/supervisor-app.conf /etc/supervisor/conf.d/

# copy uswgi config
COPY docker/config/uwsgi* /home/django/

ARG TAG_NAME
ENV BUILD_VERSION=${TAG_NAME:-NOT_DEFINED}

EXPOSE 80
COPY docker/config/sqlite/start.sh /usr/bin
RUN chmod +x /usr/bin/start.sh

ENTRYPOINT [ "start.sh" ]