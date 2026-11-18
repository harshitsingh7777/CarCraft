from django import forms

from vehicles.models import Vehicle


class VehicleForm(forms.ModelForm):
    class Meta:
        model = Vehicle

        fields = [
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
            "model_3d",
            "description",
        ]

        widgets = {
            "brand": forms.TextInput(
                attrs={"placeholder": "Brand"}
            ),
            "model": forms.TextInput(
                attrs={"placeholder": "Model"}
            ),
            "variant": forms.TextInput(
                attrs={"placeholder": "Variant"}
            ),
            "year": forms.NumberInput(
                attrs={"placeholder": "2025"}
            ),
            "color": forms.TextInput(
                attrs={"placeholder": "Black"}
            ),
            "price": forms.NumberInput(
                attrs={
                    "placeholder": "2500000",
                    "step": "0.01",
                }
            ),
            "mileage": forms.NumberInput(
                attrs={
                    "placeholder": "18.5",
                    "step": "0.01",
                }
            ),
            "engine": forms.TextInput(
                attrs={"placeholder": "1998 cc"}
            ),
            "horsepower": forms.NumberInput(
                attrs={"placeholder": "200"}
            ),
            "torque": forms.NumberInput(
                attrs={"placeholder": "320"}
            ),
            "seating_capacity": forms.NumberInput(
                attrs={"placeholder": "5"}
            ),
            "stock_quantity": forms.NumberInput(
                attrs={"placeholder": "1"}
            ),
            "description": forms.Textarea(
                attrs={
                    "placeholder": "Vehicle description..."
                }
            ),
        }