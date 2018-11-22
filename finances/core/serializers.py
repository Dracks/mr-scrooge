from rest_framework import serializers

from .model import RawDataSource
from management.models import ValuesToTag, Tag


class RawDataSerializer(serializers.ModelSerializer):
    tags = serializers.SerializerMethodField()

    def get_tags(self, rds):
        data = ValuesToTag.objects.filter(raw_data_source=rds, enable=1)
        return [ e.tag.pk for e in data ]

    def to_internal_value(self, rds):
        new_internal = super(RawDataSerializer, self).to_internal_value(rds)
        tags_list = []
        
        for tag_pk in rds.get('tags'):
            query = Tag.objects.filter(pk=tag_pk)
            if query.exists():
                tags_list.append(query.first())
            else:
                raise serializers.ValidationError({
                    'tags': 'Tag pk <{}> does not exist'.format(tag_pk)
                })
        new_internal['tags'] = tags_list
        return new_internal

    def create(self, data):
        tags_list = data['tags']
        del data['tags']
        rds = super(RawDataSerializer, self).create(data)
        for tag in tags_list:
            ValuesToTag.objects.create(tag=tag, raw_data_source=rds, automatic=0).save()
        return rds

    class Meta:
        model = RawDataSource
        fields = ('kind', 'id', 'movement_name', 'date', 'date_value', 'details', 'value', 'tags')