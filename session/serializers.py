from  django.contrib.auth.password_validation import validate_password
from rest_framework import serializers


class AbstractSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()

class ProfileSerializer(AbstractSerializer):

    def validate(self, data):
        new_password = self.initial_data.get('new-password', None)
        email = data.get('email', None)
        if new_password or email:
            password = self.initial_data.get('password', None)
            if not(password and self.instance.check_password(password)):
                raise serializers.ValidationError("Password not valid")
            if new_password:
                validate_password(new_password, self.instance)

        return super(ProfileSerializer, self).validate(data)

    def update(self, instance, validated_data):
        instance.email = validated_data.get('email', instance.email)
        instance.username = validated_data.get('username', instance.username)
        new_password = self.initial_data.get('new-password', None)
        if new_password:
            instance.set_password(new_password)
        instance.save()
        return instance


class UserSessionSerializer(AbstractSerializer):
    is_authenticated = serializers.BooleanField()
