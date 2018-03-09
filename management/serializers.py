from rest_framework import serializers
from .models import Tag, Filter

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name', 'values', 'filters', 'negate_conditional')


class FilterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filter
        fields = ('id', 'tag', 'type_conditional', 'conditional')