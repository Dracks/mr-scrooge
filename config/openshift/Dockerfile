from dracks/mrscrooge:latest-postgres

EXPOSE 8080
EXPOSE 8000

RUN mkdir -p /var/log/supervisor && chmod 777 /var/log/supervisor

COPY nginx.conf /etc/nginx/sites-available/default

