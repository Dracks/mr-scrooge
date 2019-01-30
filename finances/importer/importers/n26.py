from .abstract import AbstractImporter
from .source_file import CsvSourceFile

class Number26(AbstractImporter):
    key = "n26/es"
    file_regex = "n26-csv-transactions.*\.csv"

    _discard = 1

    _mapping = {
        'movement_name': 4,
        'date': 0,
        'date_value': 0,
        'value': 6,
        'details': 1
    }

    def _creator(self, file_name):
        return CsvSourceFile(file_name, self._discard, delimiter=',')