from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from finances.common.helper import update_instance

class AbstractSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()

class ProfileSerializer(AbstractSerializer):

    def validate(self, data):
        new_password = self.initial_data.get('new_password', None)
        password = self.initial_data.get('password', None)
        if not(password and self.instance.check_password(password)):
            raise serializers.ValidationError("Password not valid")
        if new_password:
            validate_password(new_password, self.instance)

        return super(ProfileSerializer, self).validate(data)

    def update(self, instance, validated_data):
        new_password = self.initial_data.get('new_password', None)
        update_instance(instance, validated_data)
        if new_password:
            instance.set_password(new_password)
        instance.save()
        return instance


class UserSessionSerializer(AbstractSerializer):
    is_authenticated = serializers.BooleanField()
