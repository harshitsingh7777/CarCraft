from django.contrib import admin
from .models import Vehicle


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = (
        "brand",
        "model",
        "variant",
        "year",
        "body_type",
        "price",
        "fuel_type",
        "transmission",
        "stock_quantity",
        "status",
    )

    list_filter = (
        "body_type",
        "fuel_type",
        "transmission",
        "status",
        "year",
    )

    search_fields = (
        "brand",
        "model",
        "variant",
        "color",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Vehicle Information",
            {
                "fields": (
                    "brand",
                    "model",
                    "variant",
                    "year",
                    "body_type",
                    "color",
                    "seating_capacity",
                )
            },
        ),
        (
            "Performance",
            {
                "fields": (
                    "fuel_type",
                    "transmission",
                    "engine",
                    "horsepower",
                    "torque",
                    "mileage",
                )
            },
        ),
        (
            "Inventory & Pricing",
            {
                "fields": (
                    "price",
                    "stock_quantity",
                    "status",
                )
            },
        ),
        (
            "Media",
            {
                "fields": (
                    "image",
                    "model_3d",
                    "description",
                )
            },
        ),
        (
            "System Information",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    ordering = ("-created_at",)