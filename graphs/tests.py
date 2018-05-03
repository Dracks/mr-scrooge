from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

import json

from .models import Graph

class GraphApiTest(TestCase):
    def setUp(self):
        Graph(name='ping', options='{"option1":"value"}').save()
        Graph(name='pong', options='{"o1":true, "o2":"fuck"}').save()
        self.user = User.objects.create_user(
            username='jacob', email='jacob@testing.com', password='testing!1234')
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def tearDown(self):
        Graph.objects.all().delete()
        self.user.delete()

    def test_getList(self):
        response = self.client.get('/api/graph/')
        data = json.loads(response.content)
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]['name'], 'ping')
        self.assertEqual(data[0]['option1'], 'value')
        self.assertEqual(data[1]['o1'], True)

    def test_create_graph(self):
        response = self.client.post('/api/graph/', {'name': 'new', 'xaxi': 'xaxi'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = json.loads(response.content)
        self.assertIsNotNone(data.get('id', None))