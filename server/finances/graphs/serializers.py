from rest_framework import serializers

from .models import GraphV2, Group, Graph, GroupTags, HorizontalGroup, HorizontalGroupTags

class GroupTagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupTags
        fields = ('tag', )


class GroupSerializer(serializers.ModelSerializer):
    group_tags = GroupTagsSerializer(many=True, required=False)
    class Meta:
        model = Group
        fields = ('group', 'hide_others', 'group_tags')

class HorizontalGroupTagsSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorizontalGroupTags
        fields = ('tag', )

class HorizontalGroupSerializer(serializers.ModelSerializer):
    group_tags = HorizontalGroupTagsSerializer(many=True, required=False)
    class Meta:
        model = HorizontalGroup
        fields = ('group', 'hide_others', 'group_tags')

class GraphV2Serializer(serializers.ModelSerializer):
    old_graph = serializers.PrimaryKeyRelatedField(queryset=Graph.objects.all(), required=False)
    group = GroupSerializer()
    horizontal_group = HorizontalGroupSerializer(required=False)
    class Meta:
        model = GraphV2
        fields = ('id', 'name', 'kind', 'tag_filter', 'date_range', 'old_graph', 'group', 'horizontal_group', 'accumulate')

    def create(self, validated_data):
        group = validated_data.pop('group')
        horizontal_group = validated_data.pop('horizontal_group')
        graph = GraphV2.objects.create(**validated_data)
        Group.objects.create(graph=graph, **group)
        if horizontal_group:
            HorizontalGroup.objects.create(graph=graph, **horizontal_group)
        graph.refresh_from_db()
        return graph
