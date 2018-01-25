from django.db import models

# Create your models here.

class RawDataSource(models.Model):
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
        unique_together= ('kind', 'movement_name', 'date', 'value')
