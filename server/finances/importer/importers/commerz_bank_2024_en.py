import re
from .abstract import AbstractImporter, MapLocaleDateMixin
from ..parsers import CsvSourceFile

DATE_REGEX = re.compile('(\d{4})\-(\d{2})\-(\d{2})T\d{2}:\d{2}:\d{2}')

class CommerzBank2024en(AbstractImporter, MapLocaleDateMixin):
    LOCAL_DATE_FORMAT = ["%d.%m.%Y"]

    key = "commerz-bank-2024-en"
    file_regex = "^[A-Z]{2}(?:[ ]?[0-9]){18,20}_"

    _discard = 1

    _mapping = {
        'movement_name': 8,
        'date': 10,
        'date_value': 1,
        'value': 4,
        'details': 9
    }

    def _creator(self, file_name):
        return CsvSourceFile(file_name, self._discard, delimiter=';')

    def split_message(self, message):
        if message.startswith('/'):
            sub_msg = [ x
                for x in message.split("//")
                if x.startswith("Kartenzahlung")
            ]
            if len(sub_msg)>0:
                message = sub_msg[0]

        if '//' in message:
            message = message[:message.index('//')]
            
        date_match = DATE_REGEX.search(message)
        end_index = message.find("End-To-End")
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

        if len(movement_name)>250:
            movement_name = movement_name[:250]
            
        if new_date is None:
            new_date = row[0]

        row.extend([movement_name, details, new_date])
        #print(len(row))
        row = self.map_locale_date(row)
        #print(row)
        data = super(CommerzBank2024en, self).build(row)
        data.value = float(data.value.replace(',', '.'))
        return data