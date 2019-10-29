import os
from django.test import TestCase
from finances.importer.importers.qif import Qif
from finances.importer.parsers.qif_file import QifFile

PATH = os.path.dirname(__file__)

class test_qif(TestCase):
    def setUp(self) -> None:
        self.filename = PATH + "/resources/transactions.qif"

    def test_yield(self):
        q = QifFile(self.filename)
        for i in q:
            self.assertIn(i["payee"], [
                "CARD PAYMENT TO *,300.00 GBP, RATE 1.00/GBP ON 20-06-2019, 300.00",
                "DIRECT DEBIT PAYMENT TO , MANDATE NO 0006, 69.26",
                "REGULAR TRANSFER PAYMENT TO ACCOUNT SAVING, MANDATE NO 4, 200.00"
            ])

    def test_qif_file(self):
        transactions = QifFile(self.filename)
        for t in transactions:
            self.assertIsNotNone(t["date"])
            self.assertIsNotNone(t["amount"])
            self.assertIsNotNone(t["payee"])