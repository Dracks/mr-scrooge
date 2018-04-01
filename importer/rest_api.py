from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework import viewsets
from rest_framework.decorators import list_route
from rest_framework.response import Response

from .models import StatusReport, StatusReportRow , RawDataSource
from .serializers import RawDataSerializer, StatusReportSerializer, StatusReportRowSerializer
from .importers import FORMAT_LIST

class RawDataSourceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RawDataSource.objects.all()
    serializer_class = RawDataSerializer

class ImportViewSet(viewsets.ViewSet):
    parser_classes = (MultiPartParser, FormParser,)

    @list_route(methods=['post'])
    def upload(self, request):
        data = self.request.data
        kind = data.get('kind')
        key = data.get('key')
        fileName = data.get('file').temporary_file_path()
        importer = FORMAT_LIST[kind](fileName, key)
        importer.run()
        importer.apply_filters()
        return Response(StatusReportSerializer(importer.status).data)

class StatusReportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StatusReport.objects.all()
    serializer_class = StatusReportSerializer

    @list_route(methods=['get'])
    def kinds(self, request):
        return Response(FORMAT_LIST.keys())

class StatusReportRowViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StatusReportRow.objects.all()
    serializer_class = StatusReportRowSerializer
