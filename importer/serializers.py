from rest_framework import serializers

from .models import StatusReport, StatusReportRow
from management.models import ValuesToTag, Tag


class StatusReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusReport
        fields = ('kind', 'id', 'date', 'file_name', 'status', 'description', 'rows')

class StatusReportRowSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusReportRow
        fields = ('movement_name', 'date', 'date_value', 'details', 'value', 'message')