from rest_framework import serializers

from .models import StatusReport, StatusReportRow
from finances.management.models import ValuesToTag, Tag


class StatusReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusReport
        fields = ('kind', 'id', 'date', 'file_name', 'status', 'description', 'rows')

class StatusReportRowSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusReportRow
        fields = ('id', 'movement_name', 'date', 'date_value', 'details', 'value', 'message', 'raw_data')