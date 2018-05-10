
from importer.importers.abstract import AbstractImporter

SAMPLE_DATA = [
    ('first', '1990-03-01', -20.0),
    ('second', '1990-03-02', -10.0),
    ('ingress', '1990-03-03', 100),
    ('first.second', '1990-03-04', -5.0)
]

class TestAccount(AbstractImporter):
    key = "test-account"

    _mapping = {
        'movement_name': 0,
        'date': 1,
        'value': 2
    }

    def _creator(self, contents):
        return contents