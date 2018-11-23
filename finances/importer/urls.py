from django.urls import path

from . import views
from . import rest_api

def api_views(router):
    router.register('status', rest_api.StatusReportViewSet)
    router.register('status-row', rest_api.StatusReportRowViewSet)
    router.register('import', rest_api.ImportViewSet, base_name='import')

urlpatterns = [
]