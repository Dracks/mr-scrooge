from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User

username = 'demo'
password = 'demo'
class Command(BaseCommand):
    help = "Clear all movements from the database"

    def handle(self, *args, **options):
        exist = User.objects.filter(username='demo').count()
        if exist == 0:
            user = User.objects.create_user(
                username=username,
                password=password
            )
            user.save()
            print('User "{}" created with password "{}"'.format(username, password))