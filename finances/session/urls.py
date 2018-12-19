from . import views
from . import rest_api

def api_views(router):
    router.register('session', rest_api.SessionViewSet,  base_name='session')

urlpatterns = [
    
]