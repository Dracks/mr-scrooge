from rest_framework import serializers

from .models import RawDataSource, StatusReport, StatusReportRow

class RawDataSerializer(serializers.ModelSerializer):
     class Meta:
        model = RawDataSource
        fields = ('kind', 'movement_name', 'date', 'date_value', 'details', 'value')

class StatusReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusReport
        fields = ('kind', 'id', 'date', 'file_name', 'status', 'description', 'rows')

class StatusReportRowSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusReportRow
        fields = ('movement_name', 'date', 'date_value', 'details', 'value', 'message')