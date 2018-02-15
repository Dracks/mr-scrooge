import xlrd
from django.db.utils import IntegrityError
import re

from datetime import datetime

from importer.models import RawDataSource, StatusReport, StatusReportRow, IMPORT_STATUS

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

    def __init__(self, filename, key=None):
        status = StatusReport()
        status.file_name = filename
        status.status = IMPORT_STATUS.OK
        status.save()

        self.status = status
        workbook = xlrd.open_workbook(filename)
        self.sheet = workbook.sheet_by_index(0)
        if key is not None:
            self.key = key

    def build(self, data):
        newSource = RawDataSource()
        newSource.kind = self.key
        for (key, index) in self._mapping.items():
            newSource.__setattr__(key, data[index])
        
        return newSource

    def addError(self, source, message):
        status = StatusReportRow(
            kind=source.kind,
            movement_name = source.movement_name,
            date = source.date,
            date_value = source.date_value,
            details = source.delete,
            value = source.value 
            )
        status.message = message
        status.report = self.status
        status.save()

    def run(self):
        try: 
            status = self.status
            previous = None
            discarting = True
            for irow in range(self._discard, self.sheet.nrows):
                row = list(map(mapping_excel, self.sheet.row(irow)))
                source = self.build(row)
                repe_number = RawDataSource.objects.filter(
                    kind = source.kind, 
                    movement_name = source.movement_name, 
                    date = source.date, 
                    details = source.details,
                    value = source.value).count()
                if repe_number == 0:
                    if previous is not None:
                        self.addError(previous, "Repeated row, but inserted")
                        previous.save()
                        previous = None
                    discarting = False
                    source.save()
                else:
                    if not discarting:
                        previous = source
                        discarting = True
                    else:
                        self.status.setWarning()
                        text = "repeated row, not inserted"
                        if previous is not None:
                            self.addError(previous, text)
                            previous = None
                        self.addError(source, text)
        except Exception as e:
            self.status.description = e.args
            self.status.status = IMPORT_STATUS.ERROR
            self.status.save()

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

    def build(self, data):
        if "Operaciones" in data[0]:
            return
        data[1] = datetime.strptime(data[1], '%d/%m/%Y')
        value = data[2]
        m = self.exp.match(value).groups()
        data[2] = - float(m[1].replace(',','.'))
        data.append(m[0])
        super(CaixaBankCard, self).build(data)

