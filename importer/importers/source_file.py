import xlrd
import csv
from pyquery import PyQuery as pq

def mapping_excel(e):

    if e.ctype == 1:
        return e.value
    elif e.ctype == 2:
        return float(e.value)
    elif e.ctype == 3:
        return xlrd.xldate.xldate_as_datetime(e.value,0)
    elif e.ctype == 0:
        return None
    elif e.ctype == 6:
        return None
    else:
        raise Exception("Error on Excel")

class AbstractSourceFile:
    def __init__(self, discard):
        self._discard = discard
        self.location = discard

    def __iter__(self):
        return self

    def reset(self):
        self.location = self._discard

    def __next__(self):
        return self.next()

class ExcelSourceFile(AbstractSourceFile):
    def __init__(self, filename, sheet, discard):
        super(ExcelSourceFile, self).__init__(discard)
        workbook = xlrd.open_workbook(filename)
        self.sheet = workbook.sheet_by_index(sheet)

    def next(self):
        self.location +=1
        if self.location == self.sheet.nrows:
            raise StopIteration
        irow = self.sheet.row(self.location)
        return list(map(mapping_excel, irow))

class CsvSourceFile(AbstractSourceFile):
    def __init__(self, filename, discard):
        super(CsvSourceFile, self).__init__(discard)
        self.__file = open(filename, 'r')
        self.reader = csv.reader(self.__file)
        for _ in range(0, self._discard):
            self.reader.next()

    def reset(self):
        raise Exception("Not implemented")

    def next(self):
        return self.reader.next()


class HtmlSourceFile(AbstractSourceFile):
    def __init__(self,filename, discard):
        super(HtmlSourceFile, self).__init__(discard)
        data = pq(open('tests/lista_movimientos.xls', encoding = "ISO-8859-1").read())
        self.__rows = data('tr')
        self.__length = len(self.__rows)

    def next(self):
        self.location +=1
        if self.location == self.__length:
            raise StopIteration
        children = pq(self.__rows[self.location]).children()
        return list(map(lambda e: e.text, children))


