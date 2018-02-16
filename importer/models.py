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
    kind=models.CharField(max_length=255)
    movement_name=models.CharField(max_length=255)
    date=models.DateField()
    date_value=models.DateField(null=True)
    details=models.TextField(null=True)
    value=models.FloatField()

    def __str__(self):
        return "k:{} m:{} d:{} v:{}".format(self.kind, self.movement_name, self.date, self.value)

    def __unicode__(self):
        return "k:{} m:{} d:{} v:{}".format(self.kind, self.movement_name, self.date, self.value)
    class Meta:
        abstract = True

class RawDataSource(AbstractRawDataSource):

    class Meta:
        indexes = [
            models.Index(fields=['kind', 'movement_name', 'date', 'value'])
        ]
        ordering = ('date', 'date_value')

class StatusReport(models.Model):
    date=models.DateTimeField(auto_now=True)
    file_name = models.CharField(max_length=255)
    status = models.CharField(max_length=1, choices=IMPORT_STATUS.CHOICES)
    description = models.TextField()

    def setWarning(self):
        if self.status == IMPORT_STATUS.OK:
            self.status =IMPORT_STATUS.WARNING
            self.save()

class StatusReportRow(AbstractRawDataSource):
    report = models.ForeignKey(StatusReport,on_delete=models.CASCADE)
    message = models.TextField()