import re
from datetime import datetime

from ..parsers import ExcelSourceFile, HtmlSourceFile
from .abstract import AbstractImporter, MapLocaleDateMixin, MapLocaleValueMixin

class CaixaBankAbstract(AbstractImporter, MapLocaleDateMixin):

    _discard = 0

    def build(self, row):
        row = self.map_locale_date(row)
        return super(CaixaBankAbstract, self).build(row)

    def _creator(self, file_name):
        return ExcelSourceFile(file_name, 0, self._discard)

class CaixaBankAccount2020(CaixaBankAbstract):
    key = "caixa-bank/account2020"

    file_regex = 'Moviments\_compte\_.*\.xls'

    _discard = 3

    _mapping = {
        'date': 0,
        'movement_name': 1,
        'details': 2,
        'value': 3,
    }

    LOCAL_DATE_FORMAT = ['%d %b %Y']


class CaixaBankCard2020(CaixaBankAbstract):
    key = "caixa-bank/card2020"

    file_regex = 'movimientos.*\.xls'

    _mapping = {
        'movement_name':1,
        'date': 0,
        'value': 3,
        'details':2
    }

    _discard = 1

    def build(self, row):
        row[3] = -row[3]

        return super(CaixaBankCard2020, self).build(row)


# Deprecated, is an old file format
class CaixaBankAccount(AbstractImporter):
    key = "caixa-bank/account"

    file_regex = 'Movimientos_cuenta_.*\.xls'

    _discard = 2

    _mapping = {
        'movement_name': 0,
        'date': 1,
        'date_value':2,
        'details': 3,
        'value': 4
    }

    def _creator(self, file_name):
        return ExcelSourceFile(file_name, 0, self._discard)

class CaixaBankCard(CaixaBankAccount, MapLocaleValueMixin, MapLocaleDateMixin):
    key="caixa-bank/card"

    file_regex = 'lista_movimientos.*\.xls'

    _discard = 3

    _mapping = {
        'movement_name':0,
        'date': 1,
        'value': 2,
        'details':6
    }

    exp = re.compile(r'^(.* )?(\d*.\d*\,\d*) (.*)$')


    def _creator(self, file_name):
        return HtmlSourceFile(file_name, 1)

    def build(self, row):
        if "Operaciones" in row[0]:
            return

        value = row[2]
        match_value = self.exp.match(value).groups()
        row[2] = "-"+match_value[1]

        row = self.map_locale_value(row)
        row = self.map_locale_date(row)

        while len(row)<6:
            row.append(None)
        row.append(match_value[0])
        return super(CaixaBankCard, self).build(row)
