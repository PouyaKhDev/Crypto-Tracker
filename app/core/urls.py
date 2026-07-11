from django.urls import path

from core.views import home, home_redirect

app_name = "core"

urlpatterns = [
    path("", home_redirect, name="home_redirect"),
    path("home/", home, name="home"),
]
