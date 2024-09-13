from .abstract import AbstractImporter
from ..parsers import CsvSourceFile

class Number26(AbstractImporter):
    key = "n26/es"
    file_regex = "Cuenta.*\.csv"

    _discard = 1

    _mapping = {
        'movement_name': 2,
        'date': 0,
        'date_value': 1,
        'value': 7,
        'details': 5
    }

    def _creator(self, file_name):
        return CsvSourceFile(file_name, self._discard, delimiter=',')

    def build(self, data):
        v = super(Number26, self).build(data)
        v.value = float(v.value)
        return v
