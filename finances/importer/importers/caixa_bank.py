import re

from datetime import datetime

from .abstract import AbstractImporter
from ..parsers import ExcelSourceFile, HtmlSourceFile

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


class CaixaBankCard(CaixaBankAccount):
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

    def build(self, data):
        if "Operaciones" in data[0]:
            return
        data[1] = datetime.strptime(data[1], '%d/%m/%Y')
        value = data[2]
        m = self.exp.match(value).groups()
        data[2] = - float(m[1].replace('.','').replace(',','.'))
        while len(data)<6:
            data.append(None)
        data.append(m[0])
        return super(CaixaBankAccount, self).build(data)

