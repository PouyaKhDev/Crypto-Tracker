from django.shortcuts import render, redirect


# Create your views here.
def home(request):
    """Home page view"""
    context = {}
    return render(request, "core/home.html", context)


def home_redirect(request):
    """Redirect to home view"""
    return redirect("core:home")
