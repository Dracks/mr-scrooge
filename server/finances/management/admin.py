from django.contrib import admin
from .models import Tag, Filter, ValuesToTag
# Register your models here.

class FilterInline(admin.StackedInline):
    model = Filter
    extra = 1

class ValuesInline(admin.TabularInline):
    model = ValuesToTag
    extra = 1

class TagAdmin(admin.ModelAdmin):
    inlines = [FilterInline, ValuesInline]


admin.site.register(Tag, TagAdmin)