from django.test import TestCase, TransactionTestCase
import os

from finances.core.models import RawDataSource
from ..models import StatusReport, StatusReportRow, IMPORT_STATUS
from ..importers import caixa_bank

from management.models import Tag, Filter, FilterConditionals

from .classes.importer import TestAccount, SAMPLE_DATA

PATH = os.path.dirname(__file__)

class AbstractImportTest(TestCase):
    def setUp(self):
        self.subject = TestAccount(SAMPLE_DATA)

    def tearDown(self):
        Tag.objects.all().delete()
        RawDataSource.objects.all().delete()
        StatusReportRow.objects.all().delete()
        StatusReport.objects.all().delete()

    def test_insert(self):
        self.subject.run()
        self.assertEquals(RawDataSource.objects.all().count(), 4)

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
        self.subject = caixa_bank.CaixaBankCard(PATH + "/resources/caixabank-card.xls", 'test')

    def check_errors(self, status):
        status = StatusReport.objects.filter(status=IMPORT_STATUS.ERROR)
        if (status.count()):
            for errors in status:
                print(errors.description)
            self.assertTrue(False)


    def test_insert(self):
        self.subject.run()
        self.assertEquals(RawDataSource.objects.all().count(), 4)
        self.check_errors(IMPORT_STATUS.ERROR)

    def test_duplicated(self):
        RawDataSource(
            kind="test",
            movement_name = "American company",
            date = "1990-01-05",
            value = -11.33,
            details = "( 11,99 USD) "
        ).save()
        RawDataSource(
            kind="test",
            movement_name = "Something usual",
            date = "1990-02-11",
            value = -9.5,
            details = None
        ).save()

        self.subject.run()

        self.assertEquals(RawDataSource.objects.all().count(), 4)
        self.assertEquals(StatusReportRow.objects.all().count(), 2)
        self.check_errors(IMPORT_STATUS.ERROR)

    def test_duplicated_vs_old_file(self):
        caixa_bank.CaixaBankCardOld(PATH+"/resources/caixabank-card-old.xls", "test").run()
        self.subject.run()

        self.assertEquals(RawDataSource.objects.all().count(), 4)
        self.assertEquals(StatusReportRow.objects.all().count(), 4)
        self.check_errors(IMPORT_STATUS.ERROR)


