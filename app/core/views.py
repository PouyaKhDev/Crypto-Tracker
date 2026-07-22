from django.http import HttpResponse, Http404
from django.shortcuts import render, redirect


def dashboard(request):
    """Dashboard page view"""
    if not request.user.is_authenticated:
        return redirect("accounts:login")

    context = {}
    return render(request, "core/dashboard.html", context)


def home(request):
    """Home page view"""
    if request.user:
        print(request.user)
    context = {}
    return render(request, "core/home.html", context)


def home_redirect(request):
    """Redirect to Home view"""
    return redirect("core:home")
