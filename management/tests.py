from django.test import TestCase
from datetime import date

from .models import Tag, Filter, FilterConditionals, RawDataSource
# Create your tests here.
class TagModelTest(TestCase):
    def setUp(self):
        self.rds_list = []
        for i in range(0,10):
            rds = RawDataSource(kind="test")
            rds.value = i*2-5
            rds.movement_name = "movement {}".format(i)
            rds.date = date.today()
            rds.save()
            self.rds_list.append(rds)
        self.subject = Tag(name="Test tag")
        self.subject.save()

    def tearDown(self):
        self.subject.delete()
        for rds in self.rds_list:
            rds.delete()
    
    def test_apply_filters(self):
        f = Filter(
            tag=self.subject, 
            type_conditional=FilterConditionals.CONTAINS, 
            conditional="movement")
        f.save()
        self.subject.apply_filters()
        l=self.subject.values.count()
        self.assertEqual(l, 10)


class FilterModelTests(TestCase):

    def test_filter_contains(self):
        f = Filter(type_conditional=FilterConditionals.CONTAINS, conditional="daleks")
        data1 = RawDataSource(movement_name="Dr Who is the greatest hero ever")
        data2 = RawDataSource(movement_name="Dr Who is the daleks enemy")
        self.assertFalse(f.isValid(data1))
        self.assertTrue(f.isValid(data2))

    def test_filter_not_contains(self):
        f = Filter(
            type_conditional=FilterConditionals.CONTAINS, 
            conditional="daleks",
            negate_conditional=1)
        data1 = RawDataSource(movement_name="Dr Who is the greatest hero ever")
        data2 = RawDataSource(movement_name="Dr Who is the daleks enemy")
        self.assertTrue(f.isValid(data1))
        self.assertFalse(f.isValid(data2))

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

    def test_filter_greater(self):
        f = Filter(type_conditional=FilterConditionals.GREATER, conditional="0")
        data1 = RawDataSource(value=1)
        data2 = RawDataSource(value=-1)
        data3 = RawDataSource(value=0)
        self.assertTrue(f.isValid(data1))
        self.assertFalse(f.isValid(data2))
        self.assertFalse(f.isValid(data3))

    def test_filter_greater_equal(self):
        f = Filter(type_conditional=FilterConditionals.GREATER_EQUAL, conditional="0")
        data1 = RawDataSource(value=1)
        data2 = RawDataSource(value=-1)
        data3 = RawDataSource(value=0)
        self.assertTrue(f.isValid(data1))
        self.assertFalse(f.isValid(data2))
        self.assertTrue(f.isValid(data3))

    def test_filter_lower_equal(self):
        f = Filter(type_conditional=FilterConditionals.LOWER_EQUAL, conditional="0")
        data1 = RawDataSource(value=-1)
        data2 = RawDataSource(value=1)
        data3 = RawDataSource(value=0)
        self.assertTrue(f.isValid(data1))
        self.assertFalse(f.isValid(data2))
        self.assertTrue(f.isValid(data3))

    def test_filter_lower(self):
        f = Filter(type_conditional=FilterConditionals.LOWER, conditional="0")
        data1 = RawDataSource(value=-1)
        data2 = RawDataSource(value=1)
        data3 = RawDataSource(value=0)
        self.assertTrue(f.isValid(data1))
        self.assertFalse(f.isValid(data2))
        self.assertFalse(f.isValid(data3))