import os

from .settings_base import *


def get_allowed_hosts():
    env = os.environ.get('ALLOWED_HOSTS', 'localhost')
    return env.split(',')

ALLOWED_HOSTS=get_allowed_hosts()

STATIC_ROOT = os.path.join(BASE_DIR, "static/")

DEBUG=False
