from django.urls import path


from . import rest_api

def api_views(router):
    router.register('raw-data', rest_api.RawDataSourceViewSet)