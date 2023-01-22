from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

import json

from finances.session.tests import get_user, User, PASSWORD_TEST
from finances.session.rest_api import NOT_AUTHENTICATED_RESPONSE

class MyProfileTest(TestCase):
    def setUp(self):
        self.user = get_user()
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_get(self):
        response = self.client.get('/api/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        self.assertEqual(data, {
            'email': self.user.email,
            'username': self.user.username,
            'first_name': '',
            'last_name': ''
        })

    def test_update(self):
        data = {'email': 'dracks@dracks.drk', 'first_name': 'peperoni', 'last_name': 'daleks', 'username': 'dalek'}
        response = self.client.put('/api/me/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        data['password'] = PASSWORD_TEST
        response = self.client.put('/api/me/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user = User.objects.get(pk=self.user.pk)
        self.assertEqual(user.username, data['username'])
        self.assertEqual(user.email, data['email'])

    def test_patch_password(self):
        response = self.client.patch('/api/me/', {'new-password': '123456!a', 'password': '123'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        user = User.objects.get(pk=self.user.pk)
        self.assertFalse(user.check_password('123456!ab'), "Check with incorrect password")

        response = self.client.patch('/api/me/', {'new-password': '123456!ab', 'password': PASSWORD_TEST}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user = User.objects.get(pk=self.user.pk)
        self.assertTrue(user.check_password('123456!ab'), "Check with correct password")

    def test_not_logged(self):
        client = APIClient()
        response = client.get('/api/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
class SessionTest(TestCase):
    def test_login(self):
        client = APIClient()
        data = { 'username': 'david', 'password': "peperoni"}
        response = client.post('/api/session/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(NOT_AUTHENTICATED_RESPONSE, json.loads(response.content))
