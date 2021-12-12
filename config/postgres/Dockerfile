from dracks/mrscrooge:latest

RUN pip3 install psycopg2-binary

COPY settings_append.py /tmp
RUN cat /tmp/settings_append.py >> /home/django/finances/settings.py
RUN rm /tmp/settings_append.py

