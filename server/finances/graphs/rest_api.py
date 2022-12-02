from django.shortcuts import get_object_or_404

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from drf_spectacular.utils import extend_schema_view

import json

from .serializers import GraphV2Serializer
from .models import Graph, GraphV2

def graphSerializer(data):
    options = json.loads(data.options)
    options['id'] = data.pk
    options['name'] = data.name
    return options

def graphUnserializer(data):
    pk = data.get('id', None)
    name = data.get('name', None)
    options = {
        key:data[key] for key in data.keys() if key not in ['id', 'name']
    }
    return (pk, name, json.dumps(options))

def save_new_graph(data):
    _, name, options = graphUnserializer(data)
    g = Graph(name=name, options=options)
    g.save()
    return g

class GraphViewSet(viewsets.ViewSet):
    """
    It's a custom api to parse all the information of the graph to the database.
    """

    permission_classes = (IsAuthenticated,)

    def list(self, request):
        data = [ graphSerializer(e) for e in Graph.objects.all()]
        return Response(data)

    def retrieve(self, request, pk=None):
        queryset = Graph.objects.all()
        g = get_object_or_404(queryset, pk=pk)
        return Response(graphSerializer(g))

    def create(self, request):
        g= save_new_graph(request.data)
        return Response(graphSerializer(g), status=status.HTTP_201_CREATED)
    
    def update(self, request, pk=None):
        queryset = Graph.objects.all()
        g = get_object_or_404(queryset, pk=pk)
        _, name, options = graphUnserializer(request.data)
        g.name = name
        g.options = options
        g.save()
        return Response(graphSerializer(g))


    def destroy(self, request, pk=None):
        queryset = Graph.objects.all()
        g = get_object_or_404(queryset, pk=pk)
        g.delete()
        return Response( status=status.HTTP_204_NO_CONTENT)

class GraphV2ViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated,)
    serializer_class = GraphV2Serializer
    queryset = GraphV2.objects.all()
