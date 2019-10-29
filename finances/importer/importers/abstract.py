import traceback
from datetime import datetime

from finances.core.models import RawDataSource
from finances.management.models import Tag

from ..models import IMPORT_STATUS, StatusReport, StatusReportRow


class AbstractImporter():
    key='abstract'
    file_regex = None

    _mapping = {}


    def _creator(self, file_path):
        raise Exception("Not implemented")

    def __init__(self, file_name, file_path, key=None):
        assert(self.key is not 'abstract')
        status = StatusReport()
        status.status = IMPORT_STATUS.OK
        status.file_name = file_name

        self.status = status
        self.source_file = self._creator(file_path)
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
        status = self.generate_status(source)
        status.message = message
        status.save()

    def generate_status(self, source):
        status = StatusReportRow(
            movement_name = source.movement_name,
            date = source.date,
            date_value = source.date_value,
            details = source.details,
            value = source.value
            )
        status.report = self.status
        return status

    def apply_filters(self):
        root_list = list(Tag.objects.filter(parent=None))
        for movement in self.movements:
            tags_to_filter = root_list[:]
            while len(tags_to_filter)>0:
                tag = tags_to_filter.pop()
                if tag.apply_filters_source(movement):
                    tags_to_filter.extend(tag.children.all())

    def run(self):
        status = self.status
        self.movements = []
        try:
            previous = None
            previous_status = None
            discarting = True
            for row in self.source_file:
                source = self.build(row)
                if source:
                    status_row = self.generate_status(source)
                    repe_number = RawDataSource.objects.filter(
                        kind = source.kind,
                        movement_name = source.movement_name,
                        date = source.date,
                        details = source.details,
                        value = source.value).count()
                    if repe_number == 0:
                        if previous is not None:
                            previous.save()
                            self.movements.append(source)

                            previous_status.message = "Repeated row, but inserted"
                            previous_status.raw_data = previous
                            previous_status.save()
                            previous = None
                        discarting = False
                        source.save()
                        status_row.raw_data = source
                        status_row.save()
                        self.movements.append(source)
                    else:
                        if not discarting:
                            previous = source
                            previous_status = status_row
                            discarting = True
                        else:
                            status.setWarning()
                            text = "repeated row, not inserted"
                            if previous is not None:
                                previous_status.message = text
                                previous_status.save()
                                previous = None
                            status_row.message = text
                            status_row.save()
        except Exception as e:
            status.description = traceback.format_exc()
            status.status = IMPORT_STATUS.ERROR
            status.save()


class MapLocaleValueMixin:
    def map_locale_value(self, row):
        value_index = self._mapping['value']
        row[value_index] = float(row[value_index].replace('.', '').replace(',', '.'))
        return row

class MapLocaleDateMixin:
    def map_locale_date(self, row):
        date_index_list = [self._mapping['date']]
        date_value = self._mapping.get('date_value', None)

        if date_value is not None:
            date_index_list.append(date_value)

        for date_index in date_index_list:
            row[date_index] = datetime.strptime(row[date_index], '%d/%m/%Y')

        return row
