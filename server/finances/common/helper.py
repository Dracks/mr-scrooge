def update_instance(instance, validated_data):
    for attr, value in validated_data.items():
        setattr(instance, attr, value)