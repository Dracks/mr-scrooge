from django.db import models
from mptt.models import MPTTModel, TreeForeignKey

from importer.models import RawDataSource

# Create your models here.
class FilterConditionals:
    CONTAINS = "c"
    PREFIX = "p"
    SUFFIX = "s"
    REGULAR_EXPRESION = "r"

    @staticmethod
    def contains(search, data):
        return search in data.movement_name

    @staticmethod
    def prefix(search, data):
        check = data.movement_name[:len(search)]
        return check == search

    @staticmethod
    def suffix(search, data):
        check = data.movement_name[-len(search):]
        return check == search

FILTER_FUNCTIONS={
    FilterConditionals.CONTAINS: FilterConditionals.contains,
    FilterConditionals.PREFIX: FilterConditionals.prefix,
    FilterConditionals.SUFFIX: FilterConditionals.suffix
}

FILTER_CONDITIONALS = (
    (FilterConditionals.CONTAINS, "Contains"),
    (FilterConditionals.PREFIX, "Prefix"),
    (FilterConditionals.SUFFIX, "Sufix"),
    (FilterConditionals.REGULAR_EXPRESION, "Regular expresion")
)

class Tag(models.Model):
    name = models.CharField(max_length=200)
    values = models.ManyToManyField(RawDataSource,through='ValuesToTag')

    def __str__(self):
        return self.name

class ValuesToTag(models.Model):
    raw_data_source = models.ForeignKey(RawDataSource, on_delete=None)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
    enable = models.IntegerField(default=1) # By default we enable it, only to disable manually. 
    automatic = models.IntegerField()

class Filter(models.Model):
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
    type_conditional = models.CharField(max_length=1, choices=FILTER_CONDITIONALS)
    conditional = models.CharField(max_length=200)
    negate_conditional = models.IntegerField()

    __cached_func = None

    def isValid(self, data):
        if not self.__cached_func:
            self.__cached_func = FILTER_FUNCTIONS.get(self.type_conditional, lambda e, y: False)
        return self.__cached_func(self.conditional, data)


    def __str__(self):
        return "{} > {}:{}".format(self.tag, self.type_conditional, self.conditional)