# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-03-07 00:32
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('seasons', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='teamgame',
            name='game',
            field=models.IntegerField(default=0),
        ),
    ]