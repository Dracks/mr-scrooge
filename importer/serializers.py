from rest_framework import serializers

from .models import RawDataSource, StatusReport, StatusReportRow
from management.models import ValuesToTag

# class TagsField(serializers.RelatedField):


class RawDataSerializer(serializers.ModelSerializer):
    tags = serializers.SerializerMethodField()

    def get_tags(self, rds):
        data = ValuesToTag.objects.filter(raw_data_source=rds, enable=1)
        return [ e.tag.pk for e in data ]

    class Meta:
        model = RawDataSource
        fields = ('kind', 'id', 'movement_name', 'date', 'date_value', 'details', 'value', 'tags')

class StatusReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusReport
        fields = ('kind', 'id', 'date', 'file_name', 'status', 'description', 'rows')

class StatusReportRowSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusReportRow
        fields = ('movement_name', 'date', 'date_value', 'details', 'value', 'message')