from django.db import models

# Create your models here.
class IMPORT_STATUS:
    OK = "o"
    WARNING = "w"
    ERROR = "e"

IMPORT_STATUS.CHOICES = (
    ( IMPORT_STATUS.OK, "Ok"),
    ( IMPORT_STATUS.WARNING, "Warnings"),
    ( IMPORT_STATUS.ERROR, "Error")
)

class AbstractRawDataSource(models.Model):
    movement_name=models.CharField(max_length=255)
    date=models.DateField()
    date_value=models.DateField(null=True)
    details=models.TextField(null=True, blank=True)
    value=models.FloatField()

    def __str__(self):
        return "k:{} m:{} d:{} v:{} dd:{}$".format(self.kind, self.movement_name, self.date, self.value, self.details)

    class Meta:
        abstract = True

class RawDataSource(AbstractRawDataSource):
    kind=models.CharField(max_length=255)

    class Meta:
        indexes = [
            models.Index(fields=['kind', 'movement_name', 'date', 'value'])
        ]
        ordering = ('-date', '-date_value', 'movement_name')

class StatusReport(models.Model):
    kind = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now=True)
    file_name = models.CharField(max_length=255)
    status = models.CharField(max_length=1, choices=IMPORT_STATUS.CHOICES)
    description = models.TextField()

    def setWarning(self):
        if self.status == IMPORT_STATUS.OK:
            self.status =IMPORT_STATUS.WARNING
            self.save()

    class Meta:
        ordering = ('-date', )

class StatusReportRow(AbstractRawDataSource):
    report = models.ForeignKey(StatusReport,on_delete=models.CASCADE, related_name="rows")
    message = models.TextField()