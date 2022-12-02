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
    description = models.TextField(default=None, null=True, blank=True)
    page_key = models.CharField(max_length=255, default='')
    
    def save(self, *args, **kwargs):
        if not self.page_key:
            self.page_key = f"{self.date};{self.pk}"
        super(RawDataSource, self).save(*args, **kwargs)

    def __str__(self):
        parent = AbstractRawDataSource.__str__(self)
        return "k:{} {}".format(self.kind,parent)

    class Meta:
        indexes = [
            models.Index(fields=['kind', 'movement_name', 'date', 'value']),
            models.Index(fields=['page_key']),
        ]
        ordering = ('-date', '-date_value', 'movement_name')
