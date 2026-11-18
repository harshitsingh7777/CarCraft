from django.urls import path

from . import views


app_name = "services"


urlpatterns = [
    path(
        "",
        views.service_list,
        name="service_list",
    ),
    path(
        "book/<int:service_id>/",
        views.book_service,
        name="book_service",
    ),
    path(
        "my-bookings/",
        views.my_bookings,
        name="my_bookings",
    ),
    path(
        "my-bookings/<int:appointment_id>/",
        views.booking_detail,
        name="booking_detail",
    ),
]