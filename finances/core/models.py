from django.db import models

class AbstractRawDataSource(models.Model):
    movement_name=models.CharField(max_length=255)
    date=models.DateField()
    date_value=models.DateField(null=True)
    details=models.TextField(null=True, blank=True)
    value=models.FloatField()

    def __str__(self):
        return "m:{} d:{} v:{} dd:{}$".format(self.movement_name, self.date, self.value, self.details)

    class Meta:
        abstract = True

class RawDataSource(AbstractRawDataSource):
    kind=models.CharField(max_length=255)

    def __str__(self):
        return "k:{} {}".format(self.kind,super(AbstractRawDataSource, self).__str__())

    class Meta:
        indexes = [
            models.Index(fields=['kind', 'movement_name', 'date', 'value'])
        ]
        ordering = ('-date', '-date_value', 'movement_name')
