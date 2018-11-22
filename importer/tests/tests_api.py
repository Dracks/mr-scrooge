from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

import json
import random
from datetime import date

from session.tests import get_user
from finances.core.models import RawDataSource
from management.models import Tag, ValuesToTag

class RawDataSourceApiTest(TestCase):
    def setUp(self):
        self.user = get_user()
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.rds = RawDataSource(kind="demo", movement_name="demo", date=date.today(), value=35)
        self.rds.save()
        self.tag = Tag(name="ping")
        self.tag.save()
        ValuesToTag.objects.create(tag=self.tag, raw_data_source=self.rds, automatic=1)

    def tearDown(self):
        ValuesToTag.objects.all().delete()
        RawDataSource.objects.all().delete()
        Tag.objects.all().delete()

    def test_get_data_with_tags(self):
        response = self.client.get('/api/raw-data/1/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        self.assertEqual(len(data['tags']),1)

    def test_create_new_with_tags(self):
        name = "Dr Test {}".format(random.random())
        response = self.client.post('/api/raw-data/', {
            'kind':"test",
            'value':25,
            'movement_name': name,
            'date': '2017-03-01',
            'tags': [ self.tag.pk ]
        })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        tagQuery = RawDataSource.objects.filter(movement_name=name)
        self.assertEqual(tagQuery.count(), 1)
        data = json.loads(response.content)
        self.assertEqual(len(data['tags']),1)
