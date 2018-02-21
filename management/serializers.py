from rest_framework import serializers
from .models import Tag, Filter

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name', 'values', 'filters')


class FilterSerializer(serializers.ModelSerializer):
    negate_conditional = serializers.BooleanField()
    class Meta:
        model = Filter
        fields = ('tag', 'type_conditional', 'conditional', 'negate_conditional')