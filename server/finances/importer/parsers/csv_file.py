import csv
from .abstract_file import AbstractSourceFile


class CsvSourceFile(AbstractSourceFile):
    def __init__(self, filename, discard, **kargs):
        super(CsvSourceFile, self).__init__(discard)
        self.__file = open(filename, 'r')
        self.reader = csv.reader(self.__file, **kargs)
        for _ in range(0, self._discard):
            self.reader.__next__()

    def reset(self):
        raise Exception("Not implemented")

    def __next__(self):
        return self.reader.__next__()