from django.core.management.base import BaseCommand, CommandError

from importer.importers import FORMAT_LIST

class Command(BaseCommand):
    help = "Import some file to the database"

    def add_arguments(self, parser):
        parser.add_argument('format', choices=FORMAT_LIST.keys())
        parser.add_argument('file', help="file to import")

    def handle(self, *args, **options):
        FORMAT_LIST[options.get('format')](options.get('file')).run()