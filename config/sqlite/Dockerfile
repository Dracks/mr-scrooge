# copy from https://github.com/dockerfiles/django-uwsgi-nginx

FROM ubuntu:16.04

#MAINTAINER Dockerfiles

# Install required packages and remove the apt packages cache when done.

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y \
	git \
	python3 \
	python3-dev \
	python3-setuptools \
	python3-pip \
	nginx \
	supervisor \
	sqlite3 && \
	pip3 install -U pip setuptools && \
   rm -rf /var/lib/apt/lists/*

# install uwsgi now because it takes a little while
RUN pip3 install uwsgi

# setup all the configfiles
RUN echo "daemon off;" >> /etc/nginx/nginx.conf
COPY config/sqlite/nginx.conf /etc/nginx/sites-available/default
COPY config/sqlite/supervisor-app.conf /etc/supervisor/conf.d/

# add (the rest of) our code
COPY server /home/django/
COPY view/build /home/view/

RUN pip3 install -r /home/django/requirements.txt
COPY config/sqlite/settings.py /home/django/finances
RUN (cd /home/django;python3 manage.py collectstatic)

# copy uswgi config
COPY config/uwsgi* /home/django/


EXPOSE 80
COPY config/sqlite/start.sh /usr/bin
RUN chmod +x /usr/bin/start.sh

ENTRYPOINT [ "start.sh" ]