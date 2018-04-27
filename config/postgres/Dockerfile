FROM lgatica/python-alpine:3.6

RUN pip3 install --upgrade pip

WORKDIR /home/server

COPY server/ .

COPY config/postgres/settings.py finances/

RUN pip3 install -r requirements.txt && \
    pip3 install psycopg2 
    #pip3 install uwsgi

RUN apk --no-cache add uwsgi-python3

COPY config/uwsgi* ./

COPY config/postgres/run.sh /usr/bin/run.sh

#RUN ./manage.py migrate

ENTRYPOINT [ "/usr/bin/run.sh" ]
