from django.urls import path

from . import views
from . import rest_api

def api_views(router):
    router.register('session', rest_api.SessionViewSet,  base_name='session')

urlpatterns = [
    path('api/me/', rest_api.MyProfileEndpoint.as_view())
]