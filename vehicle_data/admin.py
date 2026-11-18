from django.contrib import admin

from .models import DatasetVehicleImage, VehicleDataset


@admin.register(VehicleDataset)
class VehicleDatasetAdmin(admin.ModelAdmin):
    list_display = (
        "vehicle_id",
        "brand",
        "model_name",
        "model_variant",
        "fuel_type",
        "transmission",
        "year",
        "price",
        "state",
    )

    search_fields = (
        "vehicle_id",
        "brand",
        "model_name",
        "model_variant",
        "state",
    )

    list_filter = (
        "brand",
        "fuel_type",
        "transmission",
        "car_type",
        "year",
        "state",
    )

    ordering = (
        "brand",
        "model_name",
        "vehicle_id",
    )

    list_per_page = 50


@admin.register(DatasetVehicleImage)
class DatasetVehicleImageAdmin(admin.ModelAdmin):
    list_display = (
        "brand",
        "model_name",
        "image",
        "updated_at",
    )

    search_fields = (
        "brand",
        "model_name",
    )

    list_filter = (
        "brand",
    )

    ordering = (
        "brand",
        "model_name",
    )

    list_per_page = 50