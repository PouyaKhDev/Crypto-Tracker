from django.urls import path

from core.views import (
    dashboard,
    home_redirect,
    home,
)

app_name = "core"

urlpatterns = [
    path("", home_redirect, name="home_redirect"),
    path("home/", home, name="home"),
    path("dashboard/", dashboard, name="dashboard"),
]
