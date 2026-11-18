from functools import wraps

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db.models import Count, Sum
from django.shortcuts import get_object_or_404, redirect, render

from orders.models import Order
from services.models import Appointment
from vehicles.models import Vehicle

from .forms import VehicleForm


def dealer_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect("dealer:login")

        if not request.user.groups.filter(name="Dealer").exists():
            return render(
                request,
                "dealer/access_denied.html",
                status=403,
            )

        return view_func(request, *args, **kwargs)

    return wrapper


def dealer_login(request):
    if request.user.is_authenticated:
        if request.user.groups.filter(name="Dealer").exists():
            return redirect("dealer:dashboard")

        return render(
            request,
            "dealer/access_denied.html",
            status=403,
        )

    if request.method == "POST":
        username = request.POST.get(
            "username",
            ""
        ).strip()

        password = request.POST.get(
            "password",
            ""
        )

        user = authenticate(
            request,
            username=username,
            password=password,
        )

        if user is None:
            return render(
                request,
                "dealer/login.html",
                {
                    "error": "Invalid username or password."
                },
            )

        if not user.groups.filter(
            name="Dealer"
        ).exists():
            return render(
                request,
                "dealer/login.html",
                {
                    "error": (
                        "This account is not authorized "
                        "as a dealer."
                    )
                },
            )

        login(
            request,
            user
        )

        return redirect(
            "dealer:dashboard"
        )

    return render(
        request,
        "dealer/login.html",
    )


def dealer_logout(request):
    logout(request)

    return redirect(
        "dealer:login"
    )


@dealer_required
def dashboard(request):
    total_vehicles = Vehicle.objects.count()

    available_vehicles = Vehicle.objects.filter(
        status="AVAILABLE"
    ).count()

    reserved_vehicles = Vehicle.objects.filter(
        status="RESERVED"
    ).count()

    sold_vehicles = Vehicle.objects.filter(
        status="SOLD"
    ).count()

    context = {
        "total_vehicles": total_vehicles,
        "available_vehicles": available_vehicles,
        "reserved_vehicles": reserved_vehicles,
        "sold_vehicles": sold_vehicles,
    }

    return render(
        request,
        "dealer/dashboard.html",
        context,
    )


@dealer_required
def inventory(request):
    vehicles = Vehicle.objects.all().order_by(
        "-created_at"
    )

    search = request.GET.get(
        "search",
        ""
    ).strip()

    status = request.GET.get(
        "status",
        ""
    ).strip()

    if search:
        vehicles = vehicles.filter(
            brand__icontains=search
        ) | vehicles.filter(
            model__icontains=search
        )

    if status:
        vehicles = vehicles.filter(
            status=status
        )

    context = {
        "vehicles": vehicles,
        "search": search,
        "status": status,
    }

    return render(
        request,
        "dealer/inventory.html",
        context,
    )


@dealer_required
def add_vehicle(request):
    if request.method == "POST":
        form = VehicleForm(
            request.POST,
            request.FILES,
        )

        if form.is_valid():
            form.save()

            return redirect(
                "dealer:inventory"
            )

    else:
        form = VehicleForm()

    return render(
        request,
        "dealer/add_vehicle.html",
        {
            "form": form
        },
    )


@dealer_required
def edit_vehicle(
    request,
    vehicle_id
):
    vehicle = get_object_or_404(
        Vehicle,
        id=vehicle_id,
    )

    if request.method == "POST":
        form = VehicleForm(
            request.POST,
            request.FILES,
            instance=vehicle,
        )

        if form.is_valid():
            form.save()

            return redirect(
                "dealer:inventory"
            )

    else:
        form = VehicleForm(
            instance=vehicle
        )

    return render(
        request,
        "dealer/add_vehicle.html",
        {
            "form": form,
            "vehicle": vehicle,
        },
    )


@dealer_required
def delete_vehicle(
    request,
    vehicle_id
):
    vehicle = get_object_or_404(
        Vehicle,
        id=vehicle_id,
    )

    if request.method == "POST":
        vehicle.delete()

        return redirect(
            "dealer:inventory"
        )

    return render(
        request,
        "dealer/delete_vehicle.html",
        {
            "vehicle": vehicle
        },
    )


@dealer_required
def orders(request):
    orders = Order.objects.select_related(
        "user"
    ).prefetch_related(
        "items"
    ).order_by(
        "-created_at"
    )

    status = request.GET.get(
        "status",
        ""
    ).strip()

    if status:
        orders = orders.filter(
            status=status
        )

    return render(
        request,
        "dealer/orders.html",
        {
            "orders": orders,
            "status": status,
            "status_choices": Order.STATUS_CHOICES,
        },
    )


@dealer_required
def order_detail(
    request,
    order_id
):
    order = get_object_or_404(
        Order.objects.select_related(
            "user"
        ).prefetch_related(
            "items__product"
        ),
        id=order_id,
    )

    return render(
        request,
        "dealer/order_detail.html",
        {
            "order": order
        },
    )


@dealer_required
def update_order_status(
    request,
    order_id
):
    order = get_object_or_404(
        Order,
        id=order_id,
    )

    if request.method == "POST":
        new_status = request.POST.get(
            "status",
            ""
        ).strip()

        valid_statuses = {
            choice[0]
            for choice in Order.STATUS_CHOICES
        }

        if new_status in valid_statuses:
            order.status = new_status

            order.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

    return redirect(
        "dealer:order_detail",
        order_id=order.id,
    )


@dealer_required
def service_bookings(request):
    appointments = Appointment.objects.select_related(
        "customer",
        "vehicle",
        "service",
    ).order_by(
        "-appointment_date",
        "-appointment_time",
    )

    status = request.GET.get(
        "status",
        ""
    ).strip()

    if status:
        appointments = appointments.filter(
            status=status
        )

    return render(
        request,
        "dealer/services.html",
        {
            "appointments": appointments,
            "status": status,
            "status_choices": Appointment.STATUS_CHOICES,
        },
    )


@dealer_required
def service_detail(
    request,
    appointment_id
):
    appointment = get_object_or_404(
        Appointment.objects.select_related(
            "customer",
            "vehicle",
            "service",
        ),
        id=appointment_id,
    )

    return render(
        request,
        "dealer/service_detail.html",
        {
            "appointment": appointment,
            "status_choices": Appointment.STATUS_CHOICES,
        },
    )


@dealer_required
def update_service_status(
    request,
    appointment_id
):
    appointment = get_object_or_404(
        Appointment,
        id=appointment_id,
    )

    if request.method == "POST":
        new_status = request.POST.get(
            "status",
            ""
        ).strip()

        valid_statuses = {
            choice[0]
            for choice in Appointment.STATUS_CHOICES
        }

        if new_status in valid_statuses:
            appointment.status = new_status

            appointment.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

    return redirect(
        "dealer:service_detail",
        appointment_id=appointment.id,
    )


@dealer_required
def customers(request):
    customers = User.objects.filter(
        is_staff=False,
        is_superuser=False,
    ).annotate(
        order_count=Count(
            "orders",
            distinct=True,
        ),
        service_count=Count(
            "appointments",
            distinct=True,
        ),
    ).order_by(
        "-date_joined"
    )

    return render(
        request,
        "dealer/customers.html",
        {
            "customers": customers,
        },
    )


@dealer_required
def analytics(request):
    total_vehicles = Vehicle.objects.count()

    available_vehicles = Vehicle.objects.filter(
        status="AVAILABLE"
    ).count()

    reserved_vehicles = Vehicle.objects.filter(
        status="RESERVED"
    ).count()

    sold_vehicles = Vehicle.objects.filter(
        status="SOLD"
    ).count()

    total_orders = Order.objects.count()

    completed_orders = Order.objects.filter(
        status="DELIVERED"
    ).count()

    cancelled_orders = Order.objects.filter(
        status="CANCELLED"
    ).count()

    revenue = (
        Order.objects.filter(
            status="DELIVERED"
        ).aggregate(
            total=Sum("total_amount")
        )["total"]
        or 0
    )

    total_services = Appointment.objects.count()

    pending_services = Appointment.objects.filter(
        status="PENDING"
    ).count()

    confirmed_services = Appointment.objects.filter(
        status="CONFIRMED"
    ).count()

    completed_services = Appointment.objects.filter(
        status="COMPLETED"
    ).count()

    context = {
        "total_vehicles": total_vehicles,
        "available_vehicles": available_vehicles,
        "reserved_vehicles": reserved_vehicles,
        "sold_vehicles": sold_vehicles,
        "total_orders": total_orders,
        "completed_orders": completed_orders,
        "cancelled_orders": cancelled_orders,
        "revenue": revenue,
        "total_services": total_services,
        "pending_services": pending_services,
        "confirmed_services": confirmed_services,
        "completed_services": completed_services,
    }

    return render(
        request,
        "dealer/analytics.html",
        context,
    )