from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

import json

from session.tests import get_user
from ..models import Tag

class TagApiTest(TestCase):
    def setUp(self):
        self.tag = Tag(name="peperoni")
        self.tag.save()
        self.user = get_user()
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def tearDown(self):
        Tag.objects.all().delete()

    def test_get_list(self):
        response = self.client.get('/api/tag/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        self.assertEqual(len(data), 1)

    def test_delete(self):
        response = self.client.delete('/api/tag/{}/'.format(self.tag.pk))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

