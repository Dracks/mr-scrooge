from rest_framework import viewsets

from .models import StatusReport, StatusReportRow , RawDataSource
from .serializers import RawDataSerializer, StatusReportSerializer, StatusReportRowSerializer

class RawDataSourceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RawDataSource.objects.all()
    serializer_class = RawDataSerializer

class StatusReportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StatusReport.objects.all()
    serializer_class = StatusReportSerializer

class StatusReportRowViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StatusReportRow.objects.all()
    serializer_class = StatusReportRowSerializer
