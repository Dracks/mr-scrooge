import re
from .abstract import AbstractImporter, MapLocaleDateMixin
from ..parsers import CsvSourceFile

DATE_REGEX = re.compile('(\d{4})\-(\d{2})\-(\d{2})T\d{2}:\d{2}:\d{2}')

class CommerzBank(AbstractImporter, MapLocaleDateMixin):
    LOCAL_DATE_FORMAT = ["%d.%m.%Y"]

    key = "commerz-bank"
    file_regex = "Umsaetze_KtoNr.*\.CSV"

    _discard = 1

    _mapping = {
        'movement_name': 9,
        'date': 11,
        'date_value': 1,
        'value': 4,
        'details': 10
    }

    def _creator(self, file_name):
        return CsvSourceFile(file_name, self._discard, delimiter=',')

    def split_message(self, message):
        if message.startswith("Auszahlung"):
            message = message[len("Auszahlung"):]
        elif message.startswith("Kartenzahlung"):
            message = message[len("Kartenzahlung"):]
        date_match = DATE_REGEX.search(message)
        end_index = message.find("End-to-End-Ref")
        if date_match is not None:
            index = date_match.start()
            movement_name = message[:index]
            date_groups = date_match.groups()
            date_info = "{2}.{1}.{0}".format(*date_groups)
            slash_index = movement_name.find('/')
            details = None
            if slash_index>0:
                details = movement_name[slash_index+2:].strip()
                movement_name = movement_name[:slash_index]

            return movement_name.strip(), details, date_info

        elif end_index>0:
            return message[:end_index].strip(), None, None
        return message, None, None


    def build(self, row):
        movement_name, details, new_date = self.split_message(row[3])

        if new_date is None:
            new_date = row[0]

        row.extend([movement_name, details, new_date])

        row = self.map_locale_date(row)
        data = super(CommerzBank, self).build(row)
        data.value = float(data.value)
        return data
