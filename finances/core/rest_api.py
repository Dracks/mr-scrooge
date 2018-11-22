from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework import viewsets
from rest_framework.decorators import list_route, detail_route
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import RawDataSource
from .serializers import RawDataSerializer
from management.models import ValuesToTag


class RawDataSourceViewSet(viewsets.ReadOnlyModelViewSet, viewsets.mixins.CreateModelMixin):
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