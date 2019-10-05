from .abstract import AbstractImporter
from ..parsers import CsvSourceFile

class Number26(AbstractImporter):
    key = "n26/es"
    file_regex = "n26-csv-transactions.*\.csv"

    _discard = 1

    _mapping = {
        'movement_name': 1,
        'date': 0,
        'date_value': 0,
        'value': 6,
        'details': 4
    }

    def _creator(self, file_name):
        return CsvSourceFile(file_name, self._discard, delimiter=',')

    def build(self, data):
        v = super(Number26, self).build(data)
        v.value = float(v.value)
        return v