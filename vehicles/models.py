from django.db import models


class Vehicle(models.Model):
    FUEL_CHOICES = [
        ("PETROL", "Petrol"),
        ("DIESEL", "Diesel"),
        ("ELECTRIC", "Electric"),
        ("HYBRID", "Hybrid"),
        ("CNG", "CNG"),
    ]

    TRANSMISSION_CHOICES = [
        ("MANUAL", "Manual"),
        ("AUTOMATIC", "Automatic"),
        ("AMT", "AMT"),
        ("DCT", "DCT"),
    ]

    BODY_TYPE_CHOICES = [
        ("SUV", "SUV"),
        ("SEDAN", "Sedan"),
        ("HATCHBACK", "Hatchback"),
        ("COUPE", "Coupe"),
        ("CONVERTIBLE", "Convertible"),
        ("SPORTS", "Sports"),
        ("MPV", "MPV"),
        ("EV", "EV"),
        ("OTHER", "Other"),
    ]

    STATUS_CHOICES = [
        ("AVAILABLE", "Available"),
        ("RESERVED", "Reserved"),
        ("SOLD", "Sold"),
    ]

    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    variant = models.CharField(max_length=100, blank=True)

    year = models.PositiveIntegerField()

    body_type = models.CharField(
        max_length=20,
        choices=BODY_TYPE_CHOICES,
        default="SUV",
    )

    color = models.CharField(max_length=50)

    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    fuel_type = models.CharField(
        max_length=20,
        choices=FUEL_CHOICES,
    )

    transmission = models.CharField(
        max_length=20,
        choices=TRANSMISSION_CHOICES,
    )

    mileage = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        help_text="Mileage in km/l or km per charge",
    )

    engine = models.CharField(
        max_length=100,
        blank=True,
    )

    horsepower = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Engine power in horsepower (HP)",
    )

    torque = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Engine torque in Nm",
    )

    seating_capacity = models.PositiveIntegerField(
        default=5,
    )

    stock_quantity = models.PositiveIntegerField(
        default=0,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="AVAILABLE",
    )

    image = models.ImageField(
        upload_to="vehicles/",
        blank=True,
        null=True,
    )

    model_3d = models.FileField(
        upload_to="vehicles/3d/",
        blank=True,
        null=True,
        help_text="Optional 3D vehicle model (.glb/.gltf)",
    )

    description = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        name = f"{self.brand} {self.model}"

        if self.variant:
            name += f" {self.variant}"

        return name


class VehicleEnquiry(models.Model):
    STATUS_CHOICES = [
        ("NEW", "New"),
        ("CONTACTED", "Contacted"),
        ("CLOSED", "Closed"),
    ]

    customer = models.ForeignKey(
        "auth.User",
        on_delete=models.CASCADE,
        related_name="vehicle_enquiries",
    )

    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name="enquiries",
    )

    name = models.CharField(
        max_length=150,
    )

    email = models.EmailField()

    phone = models.CharField(
        max_length=20,
    )

    message = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="NEW",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"{self.name} - {self.vehicle}"