import os

from django.test import TestCase, TransactionTestCase

from finances.core.models import RawDataSource
from finances.management.models import Filter, FilterConditionals, Tag

from ..importers import caixa_bank, caixa_enginyers, n26, commerz_bank
from ..models import IMPORT_STATUS, StatusReport, StatusReportRow
from .classes.importer import SAMPLE_DATA, TestAccount

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

class CaixaBankAccount2020Tests(TransactionTestCase):
    def setUp(self):
        self.subject = caixa_bank.CaixaBankAccount2020('caixabank', PATH+"/resources/caixabank-account2020.xls", 'test')

    def test_insert(self):
        self.subject.run()
        self.assertEqual(RawDataSource.objects.all().count(), 3)

        income = RawDataSource.objects.get(date="2020-02-28")
        self.assertEqual(income.movement_name, "Income")
        self.assertEqual(income.value, 25.00)

class CaixaBankCard2020Tests(TransactionTestCase):
    def setUp(self):
        self.subject = caixa_bank.CaixaBankCard2020('caixabank', PATH+"/resources/caixabank-card2020.xls", 'test')

    def test_insert(self):
        self.subject.run()
        self.assertEqual(RawDataSource.objects.all().count(), 3)

        book_store = RawDataSource.objects.get(date="2020-02-10")
        self.assertEqual(book_store.movement_name, "Alguna Llibreria")
        self.assertEqual(book_store.value, -9.95)


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

        first_raw_data = RawDataSource.objects.all()[0]
        self.assertEqual(first_raw_data.page_key, f"{first_raw_data.date};{first_raw_data.id}")

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


class CaixaEnginyers(TransactionTestCase):
    def setUp(self):
        self.subject = caixa_enginyers.CaixaEnginyersAccount('caixa_enginyers', PATH+"/resources/MovimientosCuenta.xls", 'test')

    def tearDown(self):
        RawDataSource.objects.all().delete()
        StatusReportRow.objects.all().delete()
        StatusReport.objects.all().delete()

    def test_basic(self):
        self.subject.run()
        self.assertEqual(RawDataSource.objects.all().count(), 4)

        query_test = RawDataSource.objects.filter(date="2019-08-04")
        self.assertEqual(query_test.count(), 1)
        test_value = query_test.first()
        self.assertEqual(test_value.value, 1500)
        self.assertEqual(test_value.movement_name, "Dr Who")
        self.assertEqual(test_value.details, "Transfer")

        query_test = RawDataSource.objects.filter(date="2019-11-09")
        self.assertEqual(query_test.count(), 1)
        test_value = query_test.first()
        self.assertEqual(test_value.value, -2.88)
        self.assertEqual(test_value.movement_name, "OPERACIÓ VIKINI")
        self.assertEqual(test_value.details, "TARGETA *5019")

        query_test = RawDataSource.objects.filter(date="2019-10-08")
        self.assertEqual(query_test.count(), 1)
        test_value = query_test.first()
        self.assertEqual(test_value.value, -120)
        self.assertEqual(test_value.movement_name, "AI DIOS NOS AYUDE")
        self.assertEqual(test_value.details, "Bill")



class CaixaEnginyersCredit(TransactionTestCase):
    def setUp(self):
        self.subject = caixa_enginyers.CaixaEnginyersCredit('caixa_enginyers', PATH+"/resources/MovimientosTarjetaCredito.xls", 'test')

    def tearDown(self):
        RawDataSource.objects.all().delete()
        StatusReportRow.objects.all().delete()
        StatusReport.objects.all().delete()

    def test_basic(self):
        self.subject.run()
        self.assertEqual(RawDataSource.objects.all().count(), 1)

        query_test = RawDataSource.objects.filter(date="2018-05-12")
        self.assertEqual(query_test.count(), 1)
        test_value = query_test.first()
        self.assertEqual(test_value.value, -5.31)
        self.assertEqual(test_value.movement_name, "PAYPAL *SOMEHOBBY")

class CommerzBank(TransactionTestCase):
    def setUp(self):
        self.subject = commerz_bank.CommerzBank('cb', PATH+"/resources/commerz_bank.CSV", 'test')

    def test_basic(self):
        self.subject.run()
        self.assertEqual(StatusReport.objects.all().count(), 1)
        # print(StatusReport.objects.first().description)
        self.assertEqual(RawDataSource.objects.all().count(), 5)

        query_test = RawDataSource.objects.filter(date='2019-05-02')
        self.assertEqual(query_test.count(), 1)
        test_value = query_test.first()
        self.assertEqual(test_value.value, 256.01)
        self.assertEqual(test_value.movement_name, "Concept and more concepts")

        query_test = RawDataSource.objects.filter(date='2020-01-09')
        self.assertEqual(query_test.count(), 1)
        test_value = query_test.first()
        self.assertEqual(test_value.value, -25)
        self.assertEqual(test_value.movement_name, "Commerzbank 0321554")

        query_test = RawDataSource.objects.filter(date='2020-01-07')
        self.assertEqual(query_test.count(), 1)
        test_value = query_test.first()
        self.assertEqual(test_value.movement_name, "Backerei Sipl GmbH Fil.35 GIR 69036")

        query_test = RawDataSource.objects.filter(date='2020-02-09')
        self.assertEqual(query_test.count(), 1)
        test_value = query_test.first()
        self.assertEqual(test_value.movement_name, "ARAL Some address")

        query_test = RawDataSource.objects.filter(date='2020-02-07')
        self.assertEqual(query_test.count(), 1)
        test_value = query_test.first()
        self.assertEqual(test_value.movement_name, "BACKSTUBE WUENSCHE GMBH")

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
        rds = RawDataSource.objects.filter(date="2019-05-02").first()
        self.assertEqual(rds.tags.count(), 1)


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