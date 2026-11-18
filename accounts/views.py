from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.shortcuts import redirect, render


CARCRAFT_FRONTEND_URL = "http://localhost:3000/"


def login_view(request):
    """
    Handle user login.

    Successful login redirects the user back to
    the CarCraft Next.js homepage with an authentication
    signal in the query string.
    """

    if request.user.is_authenticated:
        return redirect(
            f"{CARCRAFT_FRONTEND_URL}?auth=1"
        )

    if request.method == "POST":
        username = request.POST.get("username", "").strip()
        password = request.POST.get("password", "")

        user = authenticate(
            request,
            username=username,
            password=password
        )

        if user is not None:
            login(request, user)

            return redirect(
                f"{CARCRAFT_FRONTEND_URL}?auth=1"
            )

        return render(
            request,
            "accounts/login.html",
            {
                "error": "Invalid username or password."
            }
        )

    return render(
        request,
        "accounts/login.html"
    )


def register_view(request):
    """
    Handle new user registration.

    Successful registration automatically logs the user in
    and redirects back to the CarCraft Next.js homepage.
    """

    if request.user.is_authenticated:
        return redirect(
            f"{CARCRAFT_FRONTEND_URL}?auth=1"
        )

    if request.method == "POST":
        username = request.POST.get("username", "").strip()
        email = request.POST.get("email", "").strip()
        password = request.POST.get("password", "")
        confirm_password = request.POST.get(
            "confirm_password",
            ""
        )

        if not username:
            return render(
                request,
                "accounts/register.html",
                {
                    "error": "Username is required."
                }
            )

        if not password:
            return render(
                request,
                "accounts/register.html",
                {
                    "error": "Password is required."
                }
            )

        if password != confirm_password:
            return render(
                request,
                "accounts/register.html",
                {
                    "error": "Passwords do not match."
                }
            )

        if User.objects.filter(
            username=username
        ).exists():
            return render(
                request,
                "accounts/register.html",
                {
                    "error": "Username already exists."
                }
            )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        login(request, user)

        return redirect(
            f"{CARCRAFT_FRONTEND_URL}?auth=1"
        )

    return render(
        request,
        "accounts/register.html"
    )


def logout_view(request):
    """
    Log the user out and return them to
    the CarCraft Next.js homepage.
    """

    logout(request)

    return redirect(
        f"{CARCRAFT_FRONTEND_URL}?logged_out=1"
    )