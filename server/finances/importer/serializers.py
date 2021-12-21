from rest_framework import serializers

from .models import StatusReport, StatusReportRow


class StatusReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusReport
        fields = ('kind', 'id', 'date', 'file_name', 'status', 'description', 'rows')

class StatusReportRowSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusReportRow
        fields = ('id', 'movement_name', 'date', 'date_value', 'details', 'value', 'message', 'raw_data')

class KindSerializer(serializers.Serializer):
    name = serializers.CharField()
    regex = serializers.CharField()
    