from django.core.management.base import BaseCommand, CommandError

from finances.core.models import RawDataSource,
from importer.models import StatusReport, StatusReportRow
from management.models import ValuesToTag

from importer.importers import FORMAT_LIST

class Command(BaseCommand):
    help = "Import some file to the database"

    def add_arguments(self, parser):
        parser.add_argument('format', choices=FORMAT_LIST.keys())
        parser.add_argument('file', help="file to import")
        parser.add_argument('-k', '--key', default=None, dest='key', help="By default should use the same as format value")

    def handle(self, *args, **options):
        importer = FORMAT_LIST[options.get('format')](options.get('file'), options.get('key'))
        importer.run()
        importer.apply_filters()