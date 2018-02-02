import xlrd
from django.db.utils import IntegrityError
import re

from datetime import datetime

from importer.models import RawDataSource

def mapping_excel(e):

    if e.ctype == 1:
        return e.value
    elif e.ctype == 2:
        return float(e.value)
    elif e.ctype == 3:
        return xlrd.xldate.xldate_as_datetime(e.value,0)
    elif e.ctype == 0:
        return None
    elif e.ctype == 6:
        return None
    else:
        raise Exception("Error on Excel")

class CaixaBank():
    key='caixabank/abstract'
    _mapping = {}
    _discard = 0

    def __init__(self, filename):
        workbook = xlrd.open_workbook(filename)
        self.sheet = workbook.sheet_by_index(0)

    def insert(self, data):
        newSource = RawDataSource()
        newSource.kind = self.key
        for (key, index) in self._mapping.items():
            newSource.__setattr__(key, data[index])
        try:
            newSource.save()
        except IntegrityError as e:
            print("Repe {}".format(newSource))

    def run(self):
        for irow in range(self._discard, self.sheet.nrows):
            row = list(map(mapping_excel, self.sheet.row(irow)))
            self.insert(row)


class CaixaBankAccount(CaixaBank):
    key="caixa-bank/account"

    _discard = 3

    _mapping = {
        'movement_name': 0,
        'date': 1,
        'date_value':2,
        'details': 3,
        'value': 4
    }

class CaixaBankCard(CaixaBankAccount):
    key="caixa-bank/card"

    _discard = 3

    _mapping = {
        'movement_name':0,
        'date': 1,
        'value': 2,
        'details':6
    }

    exp = re.compile('^(.* )?(\d*\,\d*) (.*)$')

    def insert(self, data):
        if "Operaciones" in data[0]:
            return
        data[1] = datetime.strptime(data[1], '%d/%m/%Y')
        value = data[2]
        m = self.exp.match(value).groups()
        data[2] = - float(m[1].replace(',','.'))
        data.append(m[0])
        super(CaixaBankCard, self).insert(data)

