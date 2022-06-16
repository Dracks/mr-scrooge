from django.db import models
from finances.management.models import Tag

# Create your models here.
class Graph(models.Model):
    name = models.CharField(max_length=255)
    kind = models.CharField(max_length=50)
    options = models.TextField() # For the moment I will put everything on a json inside here

class GraphKind:
    Bar = 'bar'
    Pie = 'pie'
    Line='line'

GraphKind.CHOICES=(
    (GraphKind.Bar, 'Bar'),
    (GraphKind.Pie, 'Pie'),
    (GraphKind.Line, 'Line')
)

class GraphGroup:
    Day='day'
    Month='month'
    Tags='tags'
    Sign='sign'  

GraphGroup.CHOICES=(
    (GraphGroup.Day,'day'),
    (GraphGroup.Month,'month'),
    (GraphGroup.Tags,'tags'),
    (GraphGroup.Sign,'sign' ), 
)

class GraphV2(models.Model):
    name = models.CharField(max_length=255)
    kind = models.CharField(max_length=10, choices=GraphKind.CHOICES)
    tag_filter = models.ForeignKey(Tag, on_delete=models.PROTECT, null=True, blank=True)
    # ToDo add choices
    date_range = models.CharField(max_length=255)
    # To keep track of the relation with old keys
    old_graph = models.ForeignKey(Graph, null=True, blank=True, on_delete=models.SET_NULL)
    accumulate = models.BooleanField(default=False)

class AbstractGroup(models.Model):
    group = models.CharField(max_length=10, choices = GraphGroup.CHOICES)
    hide_others = models.BooleanField(null=True, blank=True)
    class Meta:
        abstract=True

class Group(AbstractGroup):
    graph = models.ForeignKey(GraphV2, on_delete=models.CASCADE, related_name='group')

class GroupTags(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='group_tags')
    tag = models.ForeignKey(Tag, on_delete=models.PROTECT)

class HorizontalGroup(AbstractGroup):
    graph = models.ForeignKey(GraphV2, on_delete=models.CASCADE, related_name='horizontal_group')

class HorizontalGroupTags(models.Model):
    group = models.ForeignKey(HorizontalGroup, on_delete=models.CASCADE, related_name='group_tags')
    tag = models.ForeignKey(Tag, on_delete=models.PROTECT)
