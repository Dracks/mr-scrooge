from rest_framework import serializers
from .models import Tag, Filter, ValuesToTag

class TagSerializer(serializers.ModelSerializer):
    children = serializers.PrimaryKeyRelatedField(read_only=True, many=True)
    filters = serializers.PrimaryKeyRelatedField(read_only=True, many=True)
    class Meta:
        model = Tag
        fields = ('id', 'parent', 'children', 'name', 'filters', 'negate_conditional')


class FilterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filter
        fields = ('id', 'tag', 'type_conditional', 'conditional')

class ValuesToTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ValuesToTag
        fields = ('raw_data_source', 'tag', 'enable', 'automatic')