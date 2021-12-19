from io import StringIO
from django.core.management import call_command
from django.test import TestCase
from django.contrib.auth.models import User

class DemoUserTest(TestCase):
    def call(self, args=[]):
        self.out = StringIO()
        call_command('demouser', *args, stdout=self.out)

    def test_default(self):
        self.assertEqual(User.objects.filter(username="demo").count(), 0)
        self.call()
        self.assertEqual(User.objects.filter(username="demo").count(), 1)
        self.assertFalse(User.objects.filter(username="demo").first().is_superuser)
        self.assertIn('User "demo" created with password "demo"', self.out.getvalue())

        self.call()
        self.assertEqual(User.objects.filter(username="demo").count(), 1)

    def test_custom(self):
        self.call('-u dr_who -p allons-y -a'.split(' '))
        subject = User.objects.filter(username="dr_who").first()
        self.assertEqual('dr_who', subject.username)
        self.assertTrue(subject.is_superuser)
        self.assertTrue(subject.is_staff)
        self.assertIn('User "dr_who" created with password "allons-y"', self.out.getvalue())


