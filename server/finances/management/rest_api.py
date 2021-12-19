from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import FILTER_CONDITIONALS, Filter, Tag
from .serializers import FilterSerializer, TagSerializer


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = (IsAuthenticated,)

    @action(methods=['post'], detail=True)
    def apply_filters(self, request, pk=None):
        tag = self.get_object()
        data = tag.apply_filters()
        return Response(data)

class FilterViewSet(viewsets.ModelViewSet):
    queryset = Filter.objects.all()
    serializer_class = FilterSerializer
    filter_fields = ('tag', )
    permission_classes = (IsAuthenticated,)

    @action(methods=['get'], detail=False)
    def types(self, request):
        return Response(dict(FILTER_CONDITIONALS))
