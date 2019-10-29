from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from finances.management.models import Tag, ValuesToTag
from finances.management.serializers import ValuesToTagSerializer

from .models import RawDataSource
from .serializers import RawDataSerializer


class RawDataSourceViewSet(viewsets.ReadOnlyModelViewSet, viewsets.mixins.CreateModelMixin):
    queryset = RawDataSource.objects.all()
    serializer_class = RawDataSerializer

    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        queryset = RawDataSource.objects.all()
        from_param = self.request.query_params.get('from', None)
        to_param = self.request.query_params.get('to', None)
        if from_param is not None or to_param is not None:
            queryset = queryset.filter(date__range=(from_param, to_param))
        return queryset

    @action(methods=['delete', 'post'], detail=True, url_path='description')
    def desc(self, request, pk=None):
        rds = RawDataSource.objects.get(pk=pk)
        returnStatus = status.HTTP_202_ACCEPTED

        if request.method == 'DELETE':
            rds.description = None
            returnStatus = status.HTTP_204_NO_CONTENT
        else:
            rds.description = request.data.get('description')

        rds.save()
        return Response(RawDataSerializer(rds).data, status=returnStatus)

    @action(methods=['delete', 'post'], detail=True)
    def link(self, request, pk=None):
        rds = RawDataSource.objects.get(pk=pk)
        tag = request.data.get('tag')
        try:
            link = ValuesToTag.objects.get(raw_data_source=pk, tag=tag)
            link.automatic = (link.automatic + 1) % 2
        except ValuesToTag.MultipleObjectsReturned:
            list_links = ValuesToTag.objects.filter(raw_data_source=pk, tag=tag)
            link = list_links.first()
        except ValuesToTag.DoesNotExist:
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
        return Response(RawDataSerializer(rds).data)
