from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework import viewsets
from rest_framework.decorators import list_route, detail_route
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import StatusReport, StatusReportRow
from .serializers import StatusReportSerializer, StatusReportRowSerializer
from finances.management.models import ValuesToTag, Tag
from finances.management.serializers import ValuesToTagSerializer
from .importers import FORMAT_LIST


class ImportViewSet(viewsets.ViewSet):
    parser_classes = (MultiPartParser, FormParser,)
    
    permission_classes = (IsAuthenticated,)

    @list_route(methods=['post'])
    def upload(self, request):
        data = self.request.data
        kind = data.get('kind')
        key = data.get('key')
        print(data.get('file'), data.get('file').name)
        fileName = data.get('file').temporary_file_path()
        importer = FORMAT_LIST[kind](data.get('file').name, fileName, key)
        importer.run()
        importer.apply_filters()
        return Response(StatusReportSerializer(importer.status).data)

class StatusReportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StatusReport.objects.all()
    serializer_class = StatusReportSerializer

    permission_classes = (IsAuthenticated,)

    @list_route(methods=['get'])
    def kinds(self, request):
        return Response(FORMAT_LIST.keys())

class StatusReportRowViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StatusReportRow.objects.all()
    serializer_class = StatusReportRowSerializer

    permission_classes = (IsAuthenticated,)
