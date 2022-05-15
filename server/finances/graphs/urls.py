from django.urls import path

from . import views
from . import rest_api

def api_views(router):
    router.register('graph', rest_api.GraphViewSet, basename='graphs')
    router.register('graph-v2', rest_api.GraphV2ViewSet, basename='graphsv2')

urlpatterns = [
]