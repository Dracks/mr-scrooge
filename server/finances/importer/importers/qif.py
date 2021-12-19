from ..parsers import QifFile
from .abstract import AbstractImporter

class Qif(AbstractImporter):
    key = "qif"
    file_regex = ".*\.qif"

    _mapping = {
        'movement_name': "payee",
        'date': "date",
        'date_value': "date",
        'value': "amount",
        'details': "memo"
    }

    def _creator(self, file_name):
        return QifFile(file_name)