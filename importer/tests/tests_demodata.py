from django.core.management import call_command
from django.test import TestCase
from unittest.mock import patch


from management.models import Tag, Filter, ValuesToTag
from graphs.models import Graph
from finances.core.models import RawDataSource

@patch('importer.management.commands.demodata.MONTHS_PERIOD', 0.5)
class DemoDataTest(TestCase):

    def tearDown(self):
        ValuesToTag.objects.all().delete()
        Filter.objects.all().delete()
        Tag.objects.all().delete()
        Graph.objects.all().delete()
        RawDataSource.objects.all().delete()

    def test_tags(self):
        self.assertEqual(Tag.objects.count(), 0)
        call_command("demodata", "-t")

        self.assertEqual(Tag.objects.count(), 2)
        self.assertEqual(RawDataSource.objects.last().tags.count(), 1)
        call_command("demodata", "-t")
        self.assertEqual(Tag.objects.count(), 2)

    def test_graphs(self):
        self.assertEqual(Graph.objects.count(), 0)
        call_command("demodata", "-t", "-g")

        self.assertEqual(Graph.objects.count(), 2)
        call_command("demodata", "-g")
        self.assertEqual(Graph.objects.count(), 2)

    
    def test_data(self):
        self.assertEqual(RawDataSource.objects.count(), 0)

        call_command("demodata")
        self.assertTrue(RawDataSource.objects.count()>0)
        self.assertEqual(Tag.objects.count(), 0)