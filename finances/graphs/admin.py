from django.contrib import admin
from .models import Graph

# Register your models here.

class GraphAdmin(admin.ModelAdmin):
    model = Graph

admin.site.register(Graph, GraphAdmin)