import xlrd

from .abstract_file import AbstractSourceFile

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