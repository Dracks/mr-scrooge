import xlrd
import traceback
import re

from datetime import datetime

from importer.models import RawDataSource, StatusReport, StatusReportRow, IMPORT_STATUS
from .source_file import ExcelSourceFile, CsvSourceFile, HtmlSourceFile

class CaixaBank():
    key='caixabank/abstract'
    _mapping = {}
    def _creator(self, file_name):
        raise Exception("Not implemented")

    def __init__(self, file_name, key=None):
        status = StatusReport()
        status.status = IMPORT_STATUS.OK
        
        self.status = status
        self.source_file = self._creator(file_name)
        if key is not None:
            self.key = key
        
        status.kind = self.key
        status.save()

    def build(self, data):
        newSource = RawDataSource()
        newSource.kind = self.key
        for (key, index) in self._mapping.items():
            newSource.__setattr__(key, data[index])
        
        return newSource

    def addError(self, source, message):
        status = StatusReportRow(
            movement_name = source.movement_name,
            date = source.date,
            date_value = source.date_value,
            details = source.details,
            value = source.value 
            )
        status.message = message
        status.report = self.status
        status.save()

    def run(self):
        status = self.status
        try: 
            previous = None
            discarting = True
            for row in self.source_file:
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
            status.description = traceback.format_exc()
            status.status = IMPORT_STATUS.ERROR
            status.save()

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

