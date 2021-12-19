from ..parsers import HtmlSourceFile
from .abstract import AbstractImporter, MapLocaleDateMixin, MapLocaleValueMixin


class CaixaEnginyersAbstract(AbstractImporter, MapLocaleValueMixin, MapLocaleDateMixin):
    _mapping = {}

    def _creator(self, file_path):
        contents = HtmlSourceFile(file_path, 0)
        row = contents.next()
        while len(row) > 1:
            row = contents.next()

        # Skip the header of the table
        contents.next()
        return contents

class CaixaEnginyersAccount(CaixaEnginyersAbstract):
    key = "caixa-enginyers/account"
    file_regex = "MovimientosCuenta.*\.xls"

    _mapping = {
        'movement_name':2,
        'date': 1,
        'value': 4,
        'date_value': 3,
        'details': 6
    }

    def split_message(self, message):
        if message.startswith('R/ '):
            return "Bill", message[3:]
        elif message.startswith('TRANSF'):
            two_points = message.index(':')
            return "Transfer", message[two_points+1:]
        elif message.startswith('TARGETA'):
            return message[:13], message[14:]
        else:
            return "", message

    def build(self, row):
        if row[1] is None:
            return

        row = self.map_locale_date(row)
        row = self.map_locale_value(row)

        name_index = self._mapping['movement_name']
        details, movement_name = self.split_message(row[name_index])
        row[name_index] = movement_name
        row.append(details)

        return super(CaixaEnginyersAccount, self).build(row)

class CaixaEnginyersCredit(CaixaEnginyersAbstract):
    key = "caixa-enginyers/credit"
    file_regex = "MovimientosTarjetaCredito.*\.xls"

    _mapping = {
        'movement_name':3,
        'date': 1,
        'value': 5,
        'details': 4
    }

    def _creator(self, file_path):
        self.content = super(CaixaEnginyersCredit, self)._creator(file_path)
        # Skip the headers
        self.content.next()
        return self.content

    def build(self, row):
        if len(row)==1:
            self.content.end()
            return

        if row[1] is None:
            return

        row = self.map_locale_value(row)
        row = self.map_locale_date(row)

        return super(CaixaEnginyersCredit, self).build(row)
