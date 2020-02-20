from django.core.management.base import BaseCommand, CommandError

from finances.core.models import RawDataSource
from finances.importer.models import StatusReport, StatusReportRow
from finances.management.models import ValuesToTag

class Command(BaseCommand):
    help = "Clear all movements from the database"

    def handle(self, *args, **options):
        StatusReportRow.objects.all().delete()
        StatusReport.objects.all().delete()
        ValuesToTag.objects.all().delete()
        RawDataSource.objects.all().delete()