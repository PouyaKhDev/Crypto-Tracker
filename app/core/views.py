from django.shortcuts import render, redirect


def dashboard(request):
    """Dashboard page view"""
    context = {}
    return render(request, "core/dashboard.html", context)


def home(request):
    """Home page view"""
    context = {}
    return render(request, "core/home.html", context)


def home_redirect(request):
    """Redirect to Home view"""
    return redirect("core:home")
