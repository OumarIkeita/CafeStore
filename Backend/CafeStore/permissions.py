from rest_framework.permissions import BasePermission


class IsCafeAdmin(BasePermission):
    message = "Only cafe administrators can manage products, categories, and tables."

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if user.is_staff or user.is_superuser:
            return True

        # Supports a Users profile linked to Django's built-in User.
        profile = getattr(user, "users", None)
        return getattr(profile, "role", None) == "admin"