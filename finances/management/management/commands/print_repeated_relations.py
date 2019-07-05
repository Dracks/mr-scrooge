from django.core.management.base import BaseCommand
from django.db.models import Count

from finances.management.models import ValuesToTag

class Command(BaseCommand):
    help='Delete duplicated links between Raw Data sources and tags'

    """def clean(rds, tag):
        old = None
        vtg_query = ValuesToTag.objects.filter(raw_data_source=rds, tag=tag)
        for vtg in vtg_query:
            if old is None:
                old = vtg
            else:
                if old.enable == vtg.enable:
                    if old.automatic == 1:
                        vtg.delete()
                    elif vtg.automatic == 1:
                        old.delete()
                        old = vtg"""

    def add_arguments(self, parser):
        parser.add_argument('-d', '--details', default=False, action='store_true', help='Print the pairs that are duplicated')

    def handle(self, *args, **options):
        repeated_query = ValuesToTag.objects.all()\
                .values('raw_data_source', 'tag')\
                .annotate(total=Count('*'))\
                .filter(total__gt=1)

        count_repeated = repeated_query.count()
        if count_repeated>0:
            self.stdout.write("Found {} repeated links".format(count_repeated))
            if options.get('details'):
                for data in repeated_query:
                    self.stdout.write("Rds: {raw_data_source} Tag: {tag} count: {total}".format(**data))
        else:
            self.stdout.write("No repeated links found, your DB is ok!")