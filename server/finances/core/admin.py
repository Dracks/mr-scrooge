from django.contrib import admin
from .models import RawDataSource
from finances.management.admin import ValuesInline

# Register your models here.

class RdsAdmin(admin.ModelAdmin):
    model = RawDataSource
    inlines = [ValuesInline]

admin.site.register(RawDataSource, RdsAdmin)