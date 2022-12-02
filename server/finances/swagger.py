from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions


schema_info = openapi.Info(
    title="Mr Scrooge API",
    default_version='v1',
    description="",
    terms_of_service="",
    contact=openapi.Contact(email=""),
    license=openapi.License(name=""),
)

schema_view = get_schema_view(
    schema_info,
    public=True,
    permission_classes=(permissions.AllowAny,),
)