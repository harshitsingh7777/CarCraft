from django.db import models


class DatasetVehicleImage(models.Model):
    brand = models.CharField(max_length=100)
    model_name = models.CharField(max_length=150)

    image = models.ImageField(
        upload_to="dataset_models/"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["brand", "model_name"],
                name="unique_dataset_model_image"
            )
        ]

    def __str__(self):
        return f"{self.brand} {self.model_name}"


class VehicleDataset(models.Model):
    vehicle_id = models.BigIntegerField(
        unique=True
    )

    brand = models.CharField(
        max_length=100,
        db_index=True
    )

    model_name = models.CharField(
        max_length=150,
        db_index=True
    )

    model_variant = models.CharField(
        max_length=150,
        blank=True
    )

    car_type = models.CharField(
        max_length=50,
        blank=True,
        db_index=True
    )

    fuel_type = models.CharField(
        max_length=50,
        blank=True,
        db_index=True
    )

    transmission = models.CharField(
        max_length=50,
        blank=True,
        db_index=True
    )

    year = models.PositiveIntegerField(
        null=True,
        blank=True,
        db_index=True
    )

    kilometers = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    owner = models.CharField(
        max_length=100,
        blank=True
    )

    state = models.CharField(
        max_length=100,
        blank=True,
        db_index=True
    )

    accidental = models.CharField(
        max_length=50,
        blank=True
    )

    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        db_index=True
    )

    engine_cc = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    mileage_kmpl = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True
    )

    seating_capacity = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    image = models.ImageField(
        upload_to="dataset_vehicles/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        indexes = [
            models.Index(
                fields=["brand", "model_name"]
            ),
            models.Index(
                fields=["fuel_type", "transmission"]
            ),
            models.Index(
                fields=["year", "price"]
            ),
        ]

    def __str__(self):
        name = f"{self.brand} {self.model_name}"

        if self.model_variant:
            name += f" {self.model_variant}"

        return name

    @property
    def fallback_image(self):
        return DatasetVehicleImage.objects.filter(
            brand=self.brand,
            model_name=self.model_name
        ).first()