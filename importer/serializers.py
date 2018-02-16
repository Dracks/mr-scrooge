from rest_framework import serializers

from .models import RawDataSource, StatusReport, StatusReportRow

class RawDataSerializer(serializers.ModelSerializer):
     class Meta:
        model = RawDataSource
        fields = ('kind', 'movement_name', 'date', 'date_value', 'details', 'value')

class StatusReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusReport
        fields = ('date', 'file_name', 'status', 'description')