import os
from django.core.management.base import BaseCommand, CommandError

from finances.core.models import RawDataSource
from finances.importer.models import StatusReport, StatusReportRow
from finances.management.models import ValuesToTag

from finances.importer.importers import FORMAT_LIST

class Command(BaseCommand):
    help = "Import some file to the database"

    def add_arguments(self, parser):
        parser.add_argument('format', choices=FORMAT_LIST.keys())
        parser.add_argument('file', help="file to import")
        parser.add_argument('-k', '--key', default=None, dest='key', help="By default should use the same as format value")

    def handle(self, *args, **options):
        file_path = options.get('file')
        file_name = os.path.basename(file_path)
        importer = FORMAT_LIST[options.get('format')](file_name, file_path, options.get('key'))
        importer.run()
        importer.apply_filters()