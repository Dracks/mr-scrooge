from django.db import models

from finances.core import models as fc_models


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

class StatusReportRow(fc_models.AbstractRawDataSource):
    report = models.ForeignKey(StatusReport,on_delete=models.CASCADE, related_name="rows")
    raw_data = models.ForeignKey(fc_models.RawDataSource, on_delete=models.SET_NULL, null=True, blank=True)
    message = models.TextField()
