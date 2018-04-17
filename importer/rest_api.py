from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework import viewsets
from rest_framework.decorators import list_route, detail_route
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import StatusReport, StatusReportRow , RawDataSource
from management.models import ValuesToTag, Tag
from .serializers import RawDataSerializer, StatusReportSerializer, StatusReportRowSerializer
from management.serializers import ValuesToTagSerializer
from .importers import FORMAT_LIST

class RawDataSourceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RawDataSource.objects.all()
    serializer_class = RawDataSerializer

    permission_classes = (IsAuthenticated,)

    @detail_route(methods=['delete', 'post'])
    def link(self, request, pk=None):
        
        tag = request.data.get('tag')
        try:
            link = ValuesToTag.objects.get(raw_data_source=pk, tag=tag)
            # link.automatic = 0
        except ValuesToTag.DoesNotExist:
            rds = RawDataSource.objects.get(pk=pk)
            tag = Tag.objects.get(pk=tag)
            link = ValuesToTag(raw_data_source=rds, tag=tag, automatic=0, enable = 0)
        
        if request.method == 'DELETE' and link.enable == 1:
            link.enable = 0
        elif request.method == "POST" and link.enable == 0:
            link.enable = 1
        else:
            return Response({'error': 'Not aplied'})
        if link.enable == 0 and link.automatic == 0:
            link.delete()
        else:
            link.save()
        return Response(ValuesToTagSerializer(link).data)


class ImportViewSet(viewsets.ViewSet):
    parser_classes = (MultiPartParser, FormParser,)
    
    permission_classes = (IsAuthenticated,)

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

    permission_classes = (IsAuthenticated,)

    @list_route(methods=['get'])
    def kinds(self, request):
        return Response(FORMAT_LIST.keys())

class StatusReportRowViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StatusReportRow.objects.all()
    serializer_class = StatusReportRowSerializer

    permission_classes = (IsAuthenticated,)
