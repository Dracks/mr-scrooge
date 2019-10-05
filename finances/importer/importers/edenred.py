from datetime import datetime

from .abstract import AbstractImporter
from ..parsers import CsvSourceFile

class TicketRestaurant(AbstractImporter):
    key="edenred/ticket-restaurant"

    _discard = 11

    _mapping = {
        'movement_name': 1,
        'date': 0,
        'date_value':0,
        'value': 2
    }

    def _creator(self, file_name):
        return CsvSourceFile(file_name, self._discard, delimiter=';')

    def build(self, data):

        tmp = datetime.strptime(data[0], "%d/%m/%Y %H:%M:%S")
        data[0] = tmp
        data[2] = float(data[2].replace('.','').replace(',','.'))
        return super(TicketRestaurant, self).build(data)
