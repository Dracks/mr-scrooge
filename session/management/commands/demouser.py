from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = "Check sure there is a user like the requested on the database"

    def add_arguments(self, parser):
        parser.add_argument('-u', '--user', default='demo', help='Username')
        parser.add_argument('-p', '--password', default='demo', help='Password to be used if it is created')
        parser.add_argument('-a', '--admin', default=False, dest='admin', action='store_true', help='If set, the user should be admin')


    def handle(self, *args, **options):
        username = options.get('user')
        password = options.get('password')
        admin = options.get('admin')
        exist = User.objects.filter(username=username).count()
        if exist == 0:
            user = User.objects.create_user(
                username=username,
                password=password,
                is_superuser=admin,
                is_staff=admin
            )
            user.save()
            self.stdout.write('User "{}" created with password "{}"'.format(username, password))