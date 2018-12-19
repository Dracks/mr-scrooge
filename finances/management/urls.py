from django.urls import path

from . import views
from . import rest_api

def api_views(router):
    router.register('tag', rest_api.TagViewSet)
    router.register('tag-filter', rest_api.FilterViewSet)