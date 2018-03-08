from rest_framework import viewsets
from rest_framework.decorators import list_route
from rest_framework.response import Response

from .models import StatusReport, StatusReportRow , RawDataSource
from .serializers import RawDataSerializer, StatusReportSerializer, StatusReportRowSerializer
from .importers import FORMAT_LIST

class RawDataSourceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RawDataSource.objects.all()
    serializer_class = RawDataSerializer

class StatusReportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StatusReport.objects.all()
    serializer_class = StatusReportSerializer

    @list_route(methods=['get'])
    def kinds(self, request):
        return Response(FORMAT_LIST.keys())

class StatusReportRowViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StatusReportRow.objects.all()
    serializer_class = StatusReportRowSerializer
