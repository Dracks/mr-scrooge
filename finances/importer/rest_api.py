from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from finances.core.models import RawDataSource
from finances.management.models import Tag, ValuesToTag
from finances.management.serializers import ValuesToTagSerializer

from .importers import FORMAT_LIST
from .models import StatusReport, StatusReportRow
from .serializers import StatusReportRowSerializer, StatusReportSerializer


class ImportViewSet(viewsets.ViewSet):
    parser_classes = (MultiPartParser, FormParser,)

    permission_classes = (IsAuthenticated,)

    @action(methods=['post'], detail=False)
    def upload(self, request):
        data = self.request.data
        kind = data.get('kind')
        key = data.get('key')
        fileName = data.get('file').temporary_file_path()
        importer = FORMAT_LIST[kind](data.get('file').name, fileName, key)
        importer.run()
        importer.apply_filters()
        return Response(StatusReportSerializer(importer.status).data)

class StatusReportViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StatusReport.objects.all()
    serializer_class = StatusReportSerializer

    permission_classes = (IsAuthenticated,)

    @action(methods=['get'], detail=False)
    def kinds(self, request):
        return Response(FORMAT_LIST.keys())

    @action(methods=['get'], detail=False)
    def file_regex(self, request):
        ret = {
            key: val.file_regex for (key, val) in FORMAT_LIST.items()
        }
        return Response(ret)

    # Destroy the Status Report
    def destroy(self, request, pk=None):
        StatusReport.objects.get(pk=pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class StatusReportRowViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StatusReportRow.objects.all()
    serializer_class = StatusReportRowSerializer

    permission_classes = (IsAuthenticated,)

    # Generate a raw data source
    @action(methods=['post'], detail=True)
    def generate(self, request, pk=None):
        try:
            info = StatusReportRow.objects.get(pk=pk)
        except StatusReportRow.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if info.raw_data is not None:
            return Response(status=status.HTTP_403_FORBIDDEN)

        data = dict(info.__dict__)
        del data['_state']
        del data['report_id']
        del data['raw_data_id']
        del data['id']
        del data['message']
        data['kind']  = info.report.kind
        rds = RawDataSource(**data)
        rds.save()
        info.raw_data = rds
        info.save()
        return Response(status=status.HTTP_201_CREATED)
