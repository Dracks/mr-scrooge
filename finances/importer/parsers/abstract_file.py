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

    def next(self):
        pass