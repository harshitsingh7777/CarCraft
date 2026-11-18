from django.urls import path

from . import views


app_name = "dealer"


urlpatterns = [
    path(
        "login/",
        views.dealer_login,
        name="login",
    ),

    path(
        "logout/",
        views.dealer_logout,
        name="logout",
    ),

    path(
        "",
        views.dashboard,
        name="dashboard",
    ),

    path(
        "inventory/",
        views.inventory,
        name="inventory",
    ),

    path(
        "inventory/add/",
        views.add_vehicle,
        name="add_vehicle",
    ),

    path(
        "inventory/<int:vehicle_id>/edit/",
        views.edit_vehicle,
        name="edit_vehicle",
    ),

    path(
        "inventory/<int:vehicle_id>/delete/",
        views.delete_vehicle,
        name="delete_vehicle",
    ),

    path(
        "orders/",
        views.orders,
        name="orders",
    ),

    path(
        "orders/<int:order_id>/",
        views.order_detail,
        name="order_detail",
    ),

    path(
        "orders/<int:order_id>/status/",
        views.update_order_status,
        name="update_order_status",
    ),

    path(
        "services/",
        views.service_bookings,
        name="services",
    ),

    path(
        "services/<int:appointment_id>/",
        views.service_detail,
        name="service_detail",
    ),

    path(
        "services/<int:appointment_id>/status/",
        views.update_service_status,
        name="update_service_status",
    ),

    path(
        "customers/",
        views.customers,
        name="customers",
    ),

    path(
        "analytics/",
        views.analytics,
        name="analytics",
    ),
]