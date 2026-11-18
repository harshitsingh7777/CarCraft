from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render

from rest_framework import generics

from vehicle_data.models import VehicleDataset
from .models import Vehicle, VehicleEnquiry
from .serializers import VehicleSerializer


def vehicle_list(request):
    vehicles = Vehicle.objects.filter(
        status="AVAILABLE"
    ).order_by("-created_at")

    dataset_vehicles = VehicleDataset.objects.all().order_by(
        "-year",
        "brand",
        "model_name",
        "vehicle_id",
    )

    search = request.GET.get("search", "").strip()
    fuel = request.GET.get("fuel", "").strip()
    transmission = request.GET.get("transmission", "").strip()

    if search:
        vehicles = vehicles.filter(
            Q(brand__icontains=search) |
            Q(model__icontains=search)
        )

        dataset_vehicles = dataset_vehicles.filter(
            Q(brand__icontains=search) |
            Q(model_name__icontains=search) |
            Q(model_variant__icontains=search)
        )

    if fuel:
        vehicles = vehicles.filter(
            fuel_type=fuel
        )

        dataset_vehicles = dataset_vehicles.filter(
            fuel_type__iexact=fuel
        )

    if transmission:
        vehicles = vehicles.filter(
            transmission=transmission
        )

        dataset_vehicles = dataset_vehicles.filter(
            transmission__iexact=transmission
        )

    paginator = Paginator(
        dataset_vehicles,
        24
    )

    dataset_page_number = request.GET.get(
        "dataset_page",
        1
    )

    dataset_page = paginator.get_page(
        dataset_page_number
    )

    return render(
        request,
        "vehicles/list.html",
        {
            "vehicles": vehicles,
            "dataset_vehicles": dataset_page,
            "search": search,
            "fuel": fuel,
            "transmission": transmission,
        },
    )


def vehicle_detail(request, vehicle_id):
    vehicle = get_object_or_404(
        Vehicle,
        id=vehicle_id
    )

    return render(
        request,
        "vehicles/detail.html",
        {
            "vehicle": vehicle,
        },
    )


@login_required
def vehicle_enquiry(request, vehicle_id):
    vehicle = get_object_or_404(
        Vehicle,
        id=vehicle_id
    )

    if request.method == "POST":
        name = request.POST.get(
            "name",
            ""
        ).strip()

        email = request.POST.get(
            "email",
            ""
        ).strip()

        phone = request.POST.get(
            "phone",
            ""
        ).strip()

        message = request.POST.get(
            "message",
            ""
        ).strip()

        if not name or not email or not phone or not message:
            return render(
                request,
                "vehicles/enquiry.html",
                {
                    "vehicle": vehicle,
                    "error": "Please fill in all fields.",
                    "name": name,
                    "email": email,
                    "phone": phone,
                    "message": message,
                },
            )

        VehicleEnquiry.objects.create(
            customer=request.user,
            vehicle=vehicle,
            name=name,
            email=email,
            phone=phone,
            message=message,
        )

        return render(
            request,
            "vehicles/enquiry_confirmation.html",
            {
                "vehicle": vehicle,
            },
        )

    return render(
        request,
        "vehicles/enquiry.html",
        {
            "vehicle": vehicle,
            "name": request.user.get_full_name()
            or request.user.username,
            "email": request.user.email,
        },
    )


class VehicleListAPIView(generics.ListAPIView):
    serializer_class = VehicleSerializer

    def get_queryset(self):
        queryset = Vehicle.objects.all().order_by(
            "-created_at"
        )

        status = self.request.query_params.get(
            "status"
        )

        body_type = self.request.query_params.get(
            "body_type"
        )

        fuel_type = self.request.query_params.get(
            "fuel_type"
        )

        transmission = self.request.query_params.get(
            "transmission"
        )

        search = self.request.query_params.get(
            "search"
        )

        if status:
            queryset = queryset.filter(
                status=status
            )

        if body_type:
            queryset = queryset.filter(
                body_type=body_type
            )

        if fuel_type:
            queryset = queryset.filter(
                fuel_type=fuel_type
            )

        if transmission:
            queryset = queryset.filter(
                transmission=transmission
            )

        if search:
            queryset = queryset.filter(
                Q(brand__icontains=search) |
                Q(model__icontains=search)
            )

        return queryset


class VehicleDetailAPIView(
    generics.RetrieveAPIView
):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    lookup_field = "id"