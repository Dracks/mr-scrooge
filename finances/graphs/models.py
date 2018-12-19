from django.db import models

# Create your models here.
class Graph(models.Model):
    name = models.CharField(max_length=255)
    kind = models.CharField(max_length=50)
    options = models.TextField() # For the moment I will put everything on a json inside here

"""
class GraphOption(models.Model):
    graph = models.ForeignKey(Graph, on_delete=models.CASCADE, related_name="options")
    option = """