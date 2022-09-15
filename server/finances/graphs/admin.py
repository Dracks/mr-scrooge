from django.contrib import admin
from .models import Graph, GraphV2, Group, HorizontalGroup

# Register your models here.

class GraphAdmin(admin.ModelAdmin):
    model = Graph

class GroupInline(admin.TabularInline):
    model = Group
    extra = 0

class HorizontalGroupInline(admin.TabularInline):
    model = HorizontalGroup
    extra = 0

class GraphV2Admin(admin.ModelAdmin):
    model = GraphV2
    inlines = [GroupInline, HorizontalGroupInline] 


admin.site.register(Graph, GraphAdmin)
admin.site.register(GraphV2, GraphV2Admin)