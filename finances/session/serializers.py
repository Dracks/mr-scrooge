from rest_framework import serializers

class UserSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    is_authenticated = serializers.BooleanField()
