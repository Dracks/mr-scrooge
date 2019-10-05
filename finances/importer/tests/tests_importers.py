from django.test import TestCase, TransactionTestCase
import os

from finances.core.models import RawDataSource
from ..models import StatusReport, StatusReportRow, IMPORT_STATUS
from ..importers import caixa_bank, n26

from finances.management.models import Tag, Filter, FilterConditionals

from .classes.importer import TestAccount, SAMPLE_DATA

PATH = os.path.dirname(__file__)

class AbstractImportTest(TestCase):
    def setUp(self):
        self.subject = TestAccount("ping", SAMPLE_DATA)

    def tearDown(self):
        Tag.objects.all().delete()
        RawDataSource.objects.all().delete()
        StatusReportRow.objects.all().delete()
        StatusReport.objects.all().delete()

    def test_insert(self):
        self.subject.run()
        self.assertEqual(RawDataSource.objects.all().count(), 4)
        self.assertEqual(StatusReportRow.objects.all().count(), 4)

    def test_insert_with_tag(self):
        tag = Tag(name="Parent")
        tag.save()
        f1 = Filter(
            tag=tag,
            type_conditional=FilterConditionals.PREFIX,
            conditional="first")
        f1.save()

        self.subject.run()
        self.subject.apply_filters()

        self.assertEqual(tag.values.count(), 2)

        tag.delete()

    def test_insert_with_tag_inheritance(self):
        tag = Tag(name="Parent")
        tag.save()
        f1 = Filter(
            tag=tag,
            type_conditional=FilterConditionals.PREFIX,
            conditional="first")
        f1.save()

        child = Tag(name="Child", parent=tag)
        child.save()
        f2 = Filter(
            tag=child,
            type_conditional=FilterConditionals.SUFFIX,
            conditional="second"
        )
        f2.save()

        self.subject.run()
        self.subject.apply_filters()

        self.assertEqual(tag.values.count(), 2)
        self.assertEqual(child.values.count(), 1)

        child.delete()


class CaixaBankCardTests(TransactionTestCase):
    def setUp(self):
        self.subject = caixa_bank.CaixaBankCard('caixabank', PATH + "/resources/caixabank-card.xls", 'test')

    def check_errors(self, status):
        status = StatusReport.objects.filter(status=IMPORT_STATUS.ERROR)
        if (status.count()):
            for errors in status:
                print(errors.description)
            self.assertTrue(False)

    def test_insert(self):
        self.subject.run()
        self.assertEqual(RawDataSource.objects.all().count(), 4)
        self.check_errors(IMPORT_STATUS.ERROR)

    def test_duplicated(self):
        RawDataSource(
            kind="test",
            movement_name="American company",
            date="1990-01-05",
            value=-11.33,
            details="( 11,99 USD) "
        ).save()
        RawDataSource(
            kind="test",
            movement_name="Something usual",
            date="1990-02-11",
            value=-9.5,
            details=None
        ).save()

        self.subject.run()

        self.assertEqual(RawDataSource.objects.all().count(), 4)
        self.assertEqual(StatusReportRow.objects.all().filter(raw_data=None).count(), 2)
        self.check_errors(IMPORT_STATUS.ERROR)


class N26Test(TransactionTestCase):
    def setUp(self):
        self.subject = n26.Number26('n26', PATH + "/resources/n26_es.csv", 'test')

    def test_filters(self):
        t1 = Tag(name="Test tag")
        t1.save()
        f = Filter(
            tag=t1,
            type_conditional=FilterConditionals.GREATER,
            conditional="0")
        f.save()

        self.subject.run()
        self.subject.apply_filters()
        rds = RawDataSource.objects.filter(date="2019-01-20").first()
        self.assertEqual(rds.tags.count(), 1)


    def test_insert(self):
        self.subject.run()
        self.assertEqual(RawDataSource.objects.all().count(), 3)
        query_test = RawDataSource.objects.filter(date="2019-01-20")
        self.assertEqual(query_test.count(), 1)
        test_value = query_test.first()
        self.assertEqual(test_value.value, 120)
        self.assertEqual(test_value.movement_name, "Dr Who")

