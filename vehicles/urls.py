from django.urls import path

from . import views


urlpatterns = [
    path("", views.vehicle_list, name="vehicle_list"),
    path("<int:vehicle_id>/enquire/", views.vehicle_enquiry, name="vehicle_enquiry"),
    path("<int:vehicle_id>/", views.vehicle_detail, name="vehicle_detail"),
    path("api/", views.VehicleListAPIView.as_view(), name="vehicle_api_list"),
    path("api/<int:id>/", views.VehicleDetailAPIView.as_view(), name="vehicle_api_detail"),
]