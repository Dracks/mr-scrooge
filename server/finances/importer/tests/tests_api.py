from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from datetime import date
import json

from finances.session.tests import get_user

from finances.importer.models import StatusReport, StatusReportRow, IMPORT_STATUS
from finances.core.models import RawDataSource

DATE_TEST = date.today()

STATUS_REPORT_TEST = {
    "kind": "test",
    "file_name": "peperoni",
    "status": IMPORT_STATUS.OK,
    "description": ""
}

STATUS_REPORT_ROW_TEST = {
    "movement_name": "test",
    "date": DATE_TEST,
    "value": 65.0,
    "message": "Pim pom pum",
}

class StatusApiTest(TestCase):
    def setUp(self):
        self.user = get_user()
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.subject = StatusReport(**STATUS_REPORT_TEST)
        self.subject.save()
        self.row = StatusReportRow(report=self.subject, **STATUS_REPORT_ROW_TEST)
        self.row.save()

    def tearDown(self):
        StatusReport.objects.all().delete()
        StatusReportRow.objects.all().delete()

    def test_delete_status(self):
        response = self.client.delete('/api/status/'+str(self.subject.pk)+'/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        self.assertEqual(StatusReport.objects.all().count(), 0)
        self.assertEqual(StatusReportRow.objects.all().count(), 0)


class StatusRowApiTest(TestCase):
    def setUp(self):
        self.user = get_user()
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.report = StatusReport(**STATUS_REPORT_TEST)
        self.report.save()
        self.row1 = StatusReportRow(
            report = self.report,
            **STATUS_REPORT_ROW_TEST,
        )
        self.row1.save()

    def tearDown(self):
        StatusReport.objects.all().delete()
        StatusReportRow.objects.all().delete()
        RawDataSource.objects.all().delete()

    def test_get(self):
        response = self.client.get('/api/status-row/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = json.loads(response.content)
        self.assertTrue(len(data)>=1)
        self.assertIsNotNone(data[0].get('id'))

    def test_generate(self):
        str_id = str(self.row1.pk)
        response = self.client.post('/api/status-row/10'+str_id+'/generate/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.assertEqual(RawDataSource.objects.all().count(), 0)
        response = self.client.post('/api/status-row/'+str_id+'/generate/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(RawDataSource.objects.all().count(), 1)

        response = self.client.get('/api/status-row/'+str_id+'/')
        data = json.loads(response.content)
        body_test = {
            **STATUS_REPORT_ROW_TEST,
            'date_value': None,
            'details': None,
            'id':self.row1.pk,
            'raw_data': 1,
            'date': DATE_TEST.strftime("%Y-%m-%d")
        }
        self.assertEqual(data, body_test)

        response = self.client.post('/api/status-row/'+str_id+'/generate/')
        self.assertEqual(RawDataSource.objects.all().count(), 1)


