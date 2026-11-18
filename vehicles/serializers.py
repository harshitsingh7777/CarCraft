from rest_framework import serializers

from .models import Vehicle


class VehicleSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    model_3d_url = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = [
            "id",
            "brand",
            "model",
            "variant",
            "year",
            "body_type",
            "color",
            "price",
            "fuel_type",
            "transmission",
            "mileage",
            "engine",
            "horsepower",
            "torque",
            "seating_capacity",
            "stock_quantity",
            "status",
            "image",
            "image_url",
            "model_3d",
            "model_3d_url",
            "description",
            "created_at",
            "updated_at",
        ]

    def get_image_url(self, obj):
        request = self.context.get("request")

        if not obj.image:
            return None

        url = obj.image.url

        if request:
            return request.build_absolute_uri(url)

        return url

    def get_model_3d_url(self, obj):
        request = self.context.get("request")

        if not obj.model_3d:
            return None

        url = obj.model_3d.url

        if request:
            return request.build_absolute_uri(url)

        return url