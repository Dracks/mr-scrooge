from django.test import TestCase, TransactionTestCase
import os

from ..models import RawDataSource, StatusReport, StatusReportRow, IMPORT_STATUS
from ..importers import caixa_bank
PATH = os.path.dirname(__file__)

class CaixaBankCardTests(TransactionTestCase):
    def setUp(self):
        self.subject = caixa_bank.CaixaBankCard(PATH + "/resources/caixabank-card.xls", 'test')

    def check_errors(self, status):
        status = StatusReport.objects.filter(status=IMPORT_STATUS.ERROR)
        if (status.count()):
            for errors in status:
                print(errors.description)
            self.assertTrue(False)


    def __test_insert(self):
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


