"""finances URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter


from .core import urls as core_urls
from .importer import urls as importer_urls
from .management import urls as management_urls
from .session import urls as session_urls
from .graphs import urls as graphs_urls
from finances.swagger import schema_view
from .views import react_view

router = DefaultRouter()

core_urls.api_views(router)
importer_urls.api_views(router)
management_urls.api_views(router)
session_urls.api_views(router)
graphs_urls.api_views(router)

print(react_view)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/swagger/', schema_view.with_ui('swagger', cache_timeout=0)),
    re_path(r'^api/swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('api/',include(router.urls)),
    re_path('^.*$', react_view),
]
urlpatterns.extend(session_urls.urlpatterns)
