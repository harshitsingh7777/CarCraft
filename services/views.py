from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render

from .models import Service, Appointment
from vehicles.models import Vehicle


def service_list(request):
    services = Service.objects.filter(
        is_active=True
    ).order_by("price")

    return render(
        request,
        "services/list.html",
        {
            "services": services
        }
    )


@login_required
def book_service(request, service_id):
    service = get_object_or_404(
        Service,
        id=service_id,
        is_active=True
    )

    vehicles = Vehicle.objects.filter(
        status__in=["AVAILABLE", "RESERVED"]
    ).order_by(
        "brand",
        "model"
    )

    if request.method == "POST":
        vehicle_id = request.POST.get("vehicle")
        appointment_date = request.POST.get("appointment_date")
        appointment_time = request.POST.get("appointment_time")
        notes = request.POST.get("notes", "")

        vehicle = get_object_or_404(
            Vehicle,
            id=vehicle_id
        )

        appointment = Appointment.objects.create(
            customer=request.user,
            vehicle=vehicle,
            service=service,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            notes=notes,
        )

        return render(
            request,
            "services/confirmation.html",
            {
                "appointment": appointment
            }
        )

    context = {
        "service": service,
        "vehicles": vehicles,
    }

    return render(
        request,
        "services/book.html",
        context
    )


@login_required
def my_bookings(request):
    appointments = Appointment.objects.filter(
        customer=request.user
    ).select_related(
        "vehicle",
        "service"
    ).order_by(
        "-appointment_date",
        "-appointment_time"
    )

    return render(
        request,
        "services/my_bookings.html",
        {
            "appointments": appointments
        }
    )


@login_required
def booking_detail(request, appointment_id):
    appointment = get_object_or_404(
        Appointment.objects.select_related(
            "vehicle",
            "service"
        ),
        id=appointment_id,
        customer=request.user
    )

    return render(
        request,
        "services/booking_detail.html",
        {
            "appointment": appointment
        }
    )