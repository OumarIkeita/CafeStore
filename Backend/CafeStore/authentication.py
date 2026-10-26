
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
class CafeTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)

        user = self.user
        profile = getattr(user, "users", None)

        if user.is_superuser or user.is_staff:
            role = "admin"
        else:
            role = getattr(profile, "role", "customer")

        data["user"] = {
            "id": user.id,
            "username": user.username,
            "role": role,
        }

        return data
