from rest_framework import viewsets
from rest_framework.decorators import detail_route

from .models import Tag, Filter
from .serializers import TagSerializer, FilterSerializer

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

    @detail_route(methods=['post'])
    def apply_filters(self, request, pk=None):
        tag = self.get_object()
        tag.apply_filters()

class FilterViewSet(viewsets.ModelViewSet):
    queryset = Filter.objects.all()
    serializer_class = FilterSerializer