from django.urls import path

from . import views
from . import rest_api

def api_views(router):
    router.register('graph', rest_api.GraphViewSet, basename='graphs')

urlpatterns = [
]