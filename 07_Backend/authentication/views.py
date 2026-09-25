from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from user_management.models import UserProfile


class LoginView(APIView):
    """
    POST /api/auth/login/
    """

    def post(self, request):

        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {
                    "error": "Email and password are required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(
                email=email
            )
        except User.DoesNotExist:
            return Response(
                {
                    "error": "Invalid email or password."
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        user = authenticate(
            username=user.username,
            password=password
        )

        if user is None:
            return Response(
                {
                    "error": "Invalid email or password."
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        token, created = Token.objects.get_or_create(
            user=user
        )

        try:
            profile = UserProfile.objects.get(
                user=user
            )
        except UserProfile.DoesNotExist:
            return Response(
                {
                    "error": "User profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            {
                "token": token.key,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "profile_id": profile.id,
                    "name": profile.name,
                    "role": profile.role,
                }
            },
            status=status.HTTP_200_OK
        )


class RegisterView(APIView):
    """
    POST /api/auth/register/

    Register using:
    {
        "name": "...",
        "email": "...",
        "password": "...",
        "role": "student"
    }
    """

    def post(self, request):

        name = request.data.get("name")
        email = request.data.get("email")
        password = request.data.get("password")
        role = request.data.get("role", "student")
        bio = request.data.get("bio", "")
        profile_image = request.data.get(
            "profile_image",
            ""
        )

        if not name or not email or not password:
            return Response(
                {
                    "error": (
                        "Name, email and password "
                        "are required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        email = email.strip().lower()

        if len(password) < 8:
            return Response(
                {
                    "error": (
                        "Password must be at least "
                        "8 characters."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if UserProfile.objects.filter(
            email__iexact=email
        ).exists():
            return Response(
                {
                    "error": "Email already exists."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(
            email__iexact=email
        ).exists():
            return Response(
                {
                    "error": "Email already exists."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        valid_roles = [
            "student",
            "teacher",
            "professional",
        ]

        if role not in valid_roles:
            return Response(
                {
                    "error": "Invalid role."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        username_base = email.split("@")[0]
        username = username_base
        counter = 1

        while User.objects.filter(
            username=username
        ).exists():

            username = (
                f"{username_base}{counter}"
            )

            counter += 1

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        profile = UserProfile.objects.create(
            user=user,
            name=name.strip(),
            email=email,
            role=role,
            bio=bio,
            profile_image=profile_image
        )

        token = Token.objects.create(
            user=user
        )

        return Response(
            {
                "token": token.key,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "profile_id": profile.id,
                    "name": profile.name,
                    "role": profile.role,
                }
            },
            status=status.HTTP_201_CREATED
        )

