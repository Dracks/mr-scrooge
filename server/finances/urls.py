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
from rest_framework.schemas import get_schema_view
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView



from .core import urls as core_urls
from .importer import urls as importer_urls
from .management import urls as management_urls
from .session import urls as session_urls
from .graphs import urls as graphs_urls
from .views import react_view

router = DefaultRouter()

core_urls.api_views(router)
importer_urls.api_views(router)
management_urls.api_views(router)
session_urls.api_views(router)
graphs_urls.api_views(router)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('api/', include(router.urls)),
]
urlpatterns.extend(session_urls.urlpatterns)
urlpatterns.extend(importer_urls.urlpatterns)

urlpatterns.append(re_path('^.*$', react_view))
