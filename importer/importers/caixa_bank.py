import re

from datetime import datetime

from .abstract import AbstractImporter
from .source_file import ExcelSourceFile, CsvSourceFile, HtmlSourceFile

class CaixaBankAccount(AbstractImporter):
    key="caixa-bank/account"

    _discard = 3

    _mapping = {
        'movement_name': 0,
        'date': 1,
        'date_value':2,
        'details': 3,
        'value': 4
    }

    def _creator(self, file_name):
        return ExcelSourceFile(file_name, 0, self._discard)

class CaixaBankCardOld(CaixaBankAccount):
    key="caixa-bank/card-old"

    _discard = 3

    _mapping = {
        'movement_name':0,
        'date': 1,
        'value': 2,
        'details':6
    }

    exp = re.compile('^(.* )?(\d*.\d*\,\d*) (.*)$')

    def build(self, data):
        if "Operaciones" in data[0]:
            return
        data[1] = datetime.strptime(data[1], '%d/%m/%Y')
        value = data[2]
        m = self.exp.match(value).groups()
        data[2] = - float(m[1].replace('.','').replace(',','.'))
        data.append(m[0])
        return super(CaixaBankCardOld, self).build(data)


class CaixaBankCard(CaixaBankCardOld):
    key="caixa-bank/card"

    _mapping = {
        'movement_name':0,
        'date': 1,
        'value': 2,
        'details':4
    }


    def _creator(self, file_name):
        return HtmlSourceFile(file_name, 1)

