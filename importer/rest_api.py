from rest_framework import viewsets

from .models import StatusReport, RawDataSource
from .serializers import RawDataSerializer, StatusReportSerializer

class RawDataSourceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RawDataSource.objects.all()
    serializer_class = RawDataSerializer

class StatusReportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StatusReport.objects.all()
    serializer_class = StatusReportSerializer
