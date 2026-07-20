from django.shortcuts import render, redirect


# Create your views here.
def dashboard(request):
    """dashboard page view"""
    context = {}
    return render(request, "core/dashboard.html", context)


def dashboard_redirect(request):
    """Redirect to dashboard view"""
    return redirect("core:dashboard")
