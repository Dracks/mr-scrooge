from django.contrib.auth import authenticate
from django.contrib.auth import login as auth_login
from django.contrib.auth import logout as auth_logout
from rest_framework import status, views, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import ProfileSerializer, UserSessionSerializer

NOT_AUTHENTICATED_RESPONSE = { "is_authenticated": False }

class SessionViewSet(viewsets.ViewSet):
    """
    It's a custom api to identify a user, and set the session via cookie
    """

    #serializer_class = SessionSerializer

    def list(self, request):
        if request.user.is_authenticated:
            return Response(UserSessionSerializer(request.user).data)
        else:
            return Response(NOT_AUTHENTICATED_RESPONSE)

    def create(self, request):
        user = authenticate(request, username=request.data.get('user'), password=request.data.get('password'))
        if user and user.is_active:
            auth_login(request, user)
            return Response(UserSessionSerializer(user).data, status=status.HTTP_201_CREATED)
        else:
            return Response(NOT_AUTHENTICATED_RESPONSE)

    @action(methods=["delete"], detail=False)
    def logout(self, request, pk=None):
        auth_logout(request)
        return Response(NOT_AUTHENTICATED_RESPONSE)

class MyProfileEndpoint(views.APIView):
    """
    Manage my profile, it requires less permissions to manage that User, but the modifications should be limited
    @todo Limit and control the modifications, (change e-mail or password should require the old password
    """
    resource_name = 'profiles'

    permission_classes = (IsAuthenticated,)

    def get_object(self, request):
        return request.user

    def get(self, request, format=None):
        user = self.get_object(request)
        serializer = ProfileSerializer(user, context={'request': request, 'resource_name': 'profile'})
        return Response(serializer.data)

    def __save(self, request, partial=False):
        user = self.get_object(request)
        serializer = ProfileSerializer(user, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, format=None):
        return self.__save(request)

    def patch(self, request, format=None):
        return self.__save(request, True)
