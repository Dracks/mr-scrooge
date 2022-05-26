from rest_framework import serializers

from .models import GraphV2, Group, Graph, GroupTags, HorizontalGroup, HorizontalGroupTags

class GroupTagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupTags
        fields = ('tag', )


class GroupSerializer(serializers.ModelSerializer):
    grouptags = GroupTagsSerializer(many=True, required=False)
    class Meta:
        model = Group
        fields = ('group', 'hide_others', 'grouptags')

class HorizontalGroupTagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorizontalGroupTags
        fields = ('tag', )

class HorizontalGroupSerializer(serializers.ModelSerializer):
    horizontalgrouptags = HorizontalGroupTagsSerializer(many=True, required=False)
    class Meta:
        model = HorizontalGroup
        fields = ('group', 'hide_others', 'horizontalgrouptags')

class GraphV2Serializer(serializers.ModelSerializer):
    old_graph = serializers.PrimaryKeyRelatedField(queryset=Graph.objects.all(), required=False)
    group = GroupSerializer()
    horizontal_group = HorizontalGroupSerializer(required=False)
    class Meta:
        model = GraphV2
        fields = ('id', 'name', 'kind', 'tag_filter', 'date_range', 'old_graph', 'group', 'horizontal_group')
