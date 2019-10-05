from pyquery import PyQuery as pq
from .abstract_file import AbstractSourceFile


def get_text_stripped(e):
    t = e.text
    if t is not None:
        t = t.replace("\xa0"," ").strip()
    return t

class HtmlSourceFile(AbstractSourceFile):
    def __init__(self, filename, discard):
        super(HtmlSourceFile, self).__init__(discard)
        data = pq(open(filename, encoding = "cp1252").read())
        self.__rows = data('tr')
        self.__length = len(self.__rows)

    def next(self):
        self.location +=1
        if self.location == self.__length:
            raise StopIteration
        children = pq(self.__rows[self.location]).children()
        #row = map(lambda e: e.text.strip(), children)
        return list(map(get_text_stripped, children))


