from django.db import models
from mptt.models import MPTTModel, TreeForeignKey

from importer.models import RawDataSource

# Create your models here.
class FilterConditionals:
    CONTAINS = "c"
    PREFIX = "p"
    SUFFIX = "s"
    GREATER = "g"
    GREATER_EQUAL = "G"
    LOWER_EQUAL = "L"
    LOWER = "l"
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

    @staticmethod
    def greater(value, data):
        check = float(value)
        return data.value > check

    @staticmethod
    def greater_equal(value, data):
        check = float(value)
        return data.value >= check

    @staticmethod
    def lower_equal(value, data):
        check = float(value)
        return data.value <= check

    @staticmethod
    def lower(value, data):
        check = float(value)
        return data.value < check

FILTER_FUNCTIONS={
    FilterConditionals.CONTAINS: FilterConditionals.contains,
    FilterConditionals.PREFIX: FilterConditionals.prefix,
    FilterConditionals.SUFFIX: FilterConditionals.suffix,
    FilterConditionals.GREATER: FilterConditionals.greater,
    FilterConditionals.GREATER_EQUAL: FilterConditionals.greater_equal,
    FilterConditionals.LOWER_EQUAL: FilterConditionals.lower_equal,
    FilterConditionals.LOWER: FilterConditionals.lower,
}

FILTER_CONDITIONALS = (
    (FilterConditionals.CONTAINS, "Contains"),
    (FilterConditionals.PREFIX, "Prefix"),
    (FilterConditionals.SUFFIX, "Sufix"),
    (FilterConditionals.REGULAR_EXPRESION, "Regular expresion"),
    (FilterConditionals.GREATER, "Greater than"),
    (FilterConditionals.GREATER_EQUAL, "Greater or equal than"),
    (FilterConditionals.LOWER_EQUAL, "Lower or equal than"),
    (FilterConditionals.LOWER, "Lower than")

)

class Tag(models.Model):
    name = models.CharField(max_length=200)
    values = models.ManyToManyField(RawDataSource,through='ValuesToTag')

    def apply_filters(self):
        deleted_relations = ValuesToTag.objects.filter(tag=self, automatic=1).delete()
        filter_list = self.filters.all()
        count = 0
        for rds in RawDataSource.objects.all():
            isFilter = False
            for filter in filter_list:
                if filter.isValid(rds):
                    isFilter = True
                    break
            if isFilter:
                count += 1
                ValuesToTag.objects.create(tag=self, raw_data_source=rds, automatic=1)
        return {
            'deleted': deleted_relations[0],
            'inserted': count
        }

    def __str__(self):
        return self.name

class ValuesToTag(models.Model):
    raw_data_source = models.ForeignKey(RawDataSource, on_delete=None)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
    enable = models.IntegerField(default=1) # By default we enable it, only to disable manually. 
    automatic = models.IntegerField()


class Filter(models.Model):
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name="filters")
    type_conditional = models.CharField(max_length=1, choices=FILTER_CONDITIONALS)
    conditional = models.CharField(max_length=200)
    negate_conditional = models.IntegerField(default=0)

    __cached_func = None

    def isValid(self, data):
        if not self.__cached_func:
            self.__cached_func = FILTER_FUNCTIONS.get(self.type_conditional, lambda e, y: False)
        result = self.__cached_func(self.conditional, data)
        if self.negate_conditional == 0:
            return result
        else:
            return not result


    def __str__(self):
        return "{} > {}:{}".format(self.tag, self.type_conditional, self.conditional)