# Generated by Django 2.0.8 on 2018-11-23 07:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('importer', '0004_auto_20181123_0718'),
        ('core', '0001_initial'),
        ('management', '0005_auto_20181123_0718'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.DeleteModel(
                    name='RawDataSource',
                ),
            ],
        ),
    ]
