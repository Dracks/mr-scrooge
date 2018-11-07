from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from datetime import datetime, timedelta, date
import random

from importer.models import RawDataSource
from management.models import Tag, Filter, FilterConditionals
from graphs.models import Graph
from graphs.rest_api import save_new_graph

def getRandomInterval():
    return timedelta(hours=random.randint(10,24))

INCOME_DAY = 3
INCOME_MONEY = 2000
MONTHS_PERIOD = 7

SAMPLE_MOVEMENTS=[
    "Phone",
    "Restaurant",
    "Benzin",
    "Parking",
    "Rent"
]

class Command(BaseCommand):
    help = "Create a base set of random data for the last 6 month"

    def add_arguments(self, parser):
        parser.add_argument('-t', '--tags', default=False, action="store_true", help='Create basic tags')
        parser.add_argument('-g', '--graphs', default=False, action="store_true", help='Create basic graphs for the report page')


    def handle(self, *args, **options):
        tags_enabled = options.get('tags')
        graphs_enabled = options.get('graphs')

        if tags_enabled:
            if Tag.objects.filter(name="Expenses").count()==0:
                expenses = Tag(name="Expenses")
                expenses.save()

                Filter(tag=expenses,
                    type_conditional=FilterConditionals.LOWER,
                    conditional=0
                ).save()

            if Tag.objects.filter(name="Revenues").count()==0:
                revenues = Tag(name="Revenues")
                revenues.save()

                Filter(tag=revenues,
                    type_conditional= FilterConditionals.GREATER,
                    conditional=0
                ).save()
        """
            {
                "tag":1,
                "horizontal":"month",
                "group":"sign",
                "kind":"line",
                "acumulative":false,
                "date_range":"year",
                "name":"Income vs outcome"
            },
            {
                "tag":2,
                "horizontal":"day",
                "group":"month",
                "kind":"line",
                "acumulative":true,
                "date_range":"six",
                "name":"Compare by day"
            },
        """
        if graphs_enabled and Graph.objects.count()==0:
            expenses = Tag.objects.filter(name="Expenses").first()
            save_new_graph({
                "tag":0,
                "horizontal":"month",
                "group":"sign",
                "kind":"bar",
                "acumulative":False,
                "date_range":"year",
                "name":"Income vs outcome"
            })
            save_new_graph({
                "tag": expenses.pk,
                "horizontal":"day",
                "group":"month",
                "kind":"line",
                "acumulative":True,
                "date_range":"six",
                "name":"Compare by day"
            })
            #revenues = Tag.objects.filter(name="Revenues").first()

        now = datetime.now()
        fromDate = now - timedelta(weeks=MONTHS_PERIOD*4)
        if RawDataSource.objects.count()>0:
            latest = RawDataSource.objects.order_by('-id').first()
            if latest.date > fromDate.date():
                fromDate = datetime.combine(latest.date, datetime.min.time())

        current_month = fromDate.month
        fromDate += getRandomInterval()
        while fromDate < now:
            new_month = fromDate.month
            if current_month != new_month:
                current_month = new_month
                incomeDay = date(fromDate.year, current_month, INCOME_DAY)
                RawDataSource(movement_name="Payroll", kind="demo", date=incomeDay, value= 2000).save()

            RawDataSource(
                movement_name=random.choice(SAMPLE_MOVEMENTS),
                kind="demo",
                date= fromDate,
                value=-random.randint(10, 200)
                ).save()
            fromDate += getRandomInterval()

        for tag in Tag.objects.all():
            tag.apply_filters()
