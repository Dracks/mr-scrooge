from rest_framework import viewsets
from rest_framework.decorators import detail_route, list_route
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Tag, Filter, FILTER_CONDITIONALS
from .serializers import TagSerializer, FilterSerializer

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = (IsAuthenticated,)

    @detail_route(methods=['post'])
    def apply_filters(self, request, pk=None):
        tag = self.get_object()
        data = tag.apply_filters()
        return Response(data)

class FilterViewSet(viewsets.ModelViewSet):
    queryset = Filter.objects.all()
    serializer_class = FilterSerializer
    filter_fields = ('tag', )
    permission_classes = (IsAuthenticated,)

    @list_route(methods=['get'])
    def types(self, request):
        return Response(dict(FILTER_CONDITIONALS))