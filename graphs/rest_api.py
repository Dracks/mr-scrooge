from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

import json

from .models import Graph

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

class GraphViewSet(viewsets.ViewSet):
    """
    It's a custom api to parse all the information of the graph to the database.
    """

    permission_classes = (IsAuthenticated,)

    #serializer_class = SessionSerializer

    def list(self, request):
        data = [ graphSerializer(e) for e in Graph.objects.all()]
        return Response(data)

    def create(self, request):
        _, name, options = graphUnserializer(request.data)
        g = Graph(name=name, options=options)
        g.save()
        return Response(graphSerializer(g), status=status.HTTP_201_CREATED)
