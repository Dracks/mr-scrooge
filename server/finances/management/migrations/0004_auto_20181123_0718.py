# Generated by Django 2.0.8 on 2018-11-23 07:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
        ('management', '0003_auto_20180503_1926'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tag',
            name='values',
            field=models.ManyToManyField(related_name='tags', through='management.ValuesToTag', to='core.RawDataSource'),
        ),
    ]
