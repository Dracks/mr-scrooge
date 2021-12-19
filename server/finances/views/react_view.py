import os

# Django imports
from django.conf import settings
from django.shortcuts import render


def react_view(request):
    return render(
        request,
        "react.html",
        {
            "debug": settings.DEBUG,
            "environment": os.getenv("ENVIRONMENT_NAME", "local"),
            "version": os.getenv("BUILD_VERSION", "unknown"),
        },
    )
