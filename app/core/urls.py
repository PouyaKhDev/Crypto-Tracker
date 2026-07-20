from django.urls import path

from core.views import dashboard, dashboard_redirect

app_name = "core"

urlpatterns = [
    path("", dashboard_redirect, name="dashboard_redirect"),
    path("dashboard/", dashboard, name="dashboard"),
]
