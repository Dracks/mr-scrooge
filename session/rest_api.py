from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import list_route

from .serializers import UserSerializer


NOT_AUTHENTICATED_RESPONSE = { "is_authenticated": False }

class SessionViewSet(viewsets.ViewSet):
    """
    It's a custom api to identify a user, and set the session via cookie
    """

    #serializer_class = SessionSerializer

    def list(self, request):
        if request.user.is_authenticated:
            return Response(UserSerializer(request.user).data)
        else:
            return Response(NOT_AUTHENTICATED_RESPONSE)

    def create(self, request):
        user = authenticate(request, username=request.data.get('user'), password=request.data.get('password'))
        if user and user.is_active:
            auth_login(request, user)
            return Response(UserSerializer(user).data)
        else:
            return Response(NOT_AUTHENTICATED_RESPONSE)
    
    @list_route(methods=["DELETE"])
    def logout(self, request, pk=None):
        auth_logout(request)
        return Response(NOT_AUTHENTICATED_RESPONSE)