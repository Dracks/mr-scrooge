from rest_framework import serializers

from .models import GraphV2, Group, Graph, GroupTags, HorizontalGroup, HorizontalGroupTags
from finances.common.helper import update_instance

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
        fields = ('group', 'hide_others', 'group_tags', 'accumulate')

class GraphV2Serializer(serializers.ModelSerializer):
    old_graph = serializers.PrimaryKeyRelatedField(queryset=Graph.objects.all(), required=False, allow_null=True)
    group = GroupSerializer()
    horizontal_group = HorizontalGroupSerializer(required=False, allow_null=True)
    class Meta:
        model = GraphV2
        fields = ('id', 'name', 'kind', 'tag_filter', 'date_range', 'old_graph', 'group', 'horizontal_group')

    def update(self, instance, validated_data):
        group = validated_data.pop('group')
        horizontal_group = validated_data.pop('horizontal_group', {})
        update_instance(instance, validated_data)
        instance.save()
        
        group_tags = group.pop('group_tags', [])
        update_instance(instance.group, group)
        GroupTags.objects.filter(group=instance.group).delete()
        for newGroupTag in group_tags:
            GroupTags.objects.create(group=instance.group, **newGroupTag)
        instance.group.save()

        if horizontal_group:
            horizontal_group_tags = horizontal_group.pop("group_tags", [])
            try: 
                hg_instance = instance.horizontal_group 
            except GraphV2.horizontal_group.RelatedObjectDoesNotExist:
                hg_instance = HorizontalGroup.objects.create(graph=instance, **horizontal_group)
            update_instance(hg_instance, horizontal_group) 
            HorizontalGroupTags.objects.filter(group=hg_instance).delete()
            for newGroupTag in horizontal_group_tags:
                HorizontalGroupTags.objects.create(group=hg_instance, **newGroupTag)
            hg_instance.save()
        
        return instance

    def create(self, validated_data):
        group = validated_data.pop('group')
        horizontal_group = validated_data.pop('horizontal_group', {})
        graph = GraphV2.objects.create(**validated_data)

        group_tags = group.pop('group_tags', [])
        group_instance = Group.objects.create(graph=graph, **group)
        for newGroupTag in group_tags:
            GroupTags.objects.create(group=group_instance, **newGroupTag)
        if horizontal_group:
            horizontal_group_tags = horizontal_group.pop("group_tags", [])
            hg_instance = HorizontalGroup.objects.create(graph=graph, **horizontal_group)
            for newGroupTag in horizontal_group_tags:
                HorizontalGroupTags.objects.create(group=hg_instance, **newGroupTag)
        graph.refresh_from_db()
        return graph
