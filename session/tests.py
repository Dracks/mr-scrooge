from django.test import TestCase
from django.contrib.auth.models import User

# Create your tests here.

def get_user():
    return User.objects.create_user(
            username='jacob', email='jacob@testing.com', password='testing!1234')