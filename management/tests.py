from django.test import TestCase

from .models import Filter, FilterConditionals, RawDataSource
# Create your tests here.

class FilterModelTests(TestCase):

    def test_filter_contains(self):
        f = Filter(type_conditional=FilterConditionals.CONTAINS, conditional="daleks")
        data1 = RawDataSource(movement_name="Dr Who is the greatest hero ever")
        data2 = RawDataSource(movement_name="Dr Who is the daleks enemy")
        self.assertFalse(f.isValid(data1))
        self.assertTrue(f.isValid(data2))

    def test_filter_prefix(self):
        f = Filter(type_conditional=FilterConditionals.PREFIX, conditional="Dr Who")
        data1 = RawDataSource(movement_name="Dr Strange is the best magician")
        data2 = RawDataSource(movement_name="Dr Who is the dalek enemy")
        self.assertFalse(f.isValid(data1))
        self.assertTrue(f.isValid(data2))

    def test_filter_suffix(self):
        f = Filter(type_conditional=FilterConditionals.SUFFIX, conditional="enemy")
        data1 = RawDataSource(movement_name="Dr Who is the greatest hero ever")
        data2 = RawDataSource(movement_name="Dr Who is the dalek enemy")
        self.assertFalse(f.isValid(data1))
        self.assertTrue(f.isValid(data2))