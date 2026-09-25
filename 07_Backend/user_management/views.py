from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserProfile, ConnectedProfile
from skill_management.models import Skill
from .serializers import (
    UserProfileSerializer,
    ConnectedProfileSerializer,
)


class UserProfileListCreateView(APIView):
    """
    GET  /api/users/
    POST /api/users/
    """

    def get(self, request):
        users = UserProfile.objects.all().order_by("-created_at")

        serializer = UserProfileSerializer(
            users,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def post(self, request):
        serializer = UserProfileSerializer(
            data=request.data
        )

        if serializer.is_valid():
            user = serializer.save()

            return Response(
                UserProfileSerializer(user).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class UserSkillsView(APIView):
    """
    GET /api/users/<user_id>/skills/
    """

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = UserProfile.objects.get(id=user_id)
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            {
                "user_id": user.id,
                "teaching_skills": [
                    {
                        "id": skill.id,
                        "name": skill.name,
                        "category": skill.category,
                    }
                    for skill in user.teaching_skills.all()
                ],
                "learning_skills": [
                    {
                        "id": skill.id,
                        "name": skill.name,
                        "category": skill.category,
                    }
                    for skill in user.learning_skills.all()
                ],
            },
            status=status.HTTP_200_OK
        )


class UserMatchesView(APIView):
    """
    GET /api/users/<user_id>/matches/
    """

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):

        try:
            current_profile = UserProfile.objects.get(
                user=request.user
            )

        except UserProfile.DoesNotExist:

            return Response(
                {
                    "error": "User profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if current_profile.id != user_id:

            return Response(
                {
                    "error": "You can only view your own matches."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        user = current_profile

        matches = []

        teaching_skills = user.teaching_skills.all()
        learning_skills = user.learning_skills.all()

        for other_user in UserProfile.objects.exclude(
            id=user.id
        ):

            other_teaching_skills = (
                other_user.teaching_skills.all()
            )

            other_learning_skills = (
                other_user.learning_skills.all()
            )

            teaches_what_user_learns = (
                learning_skills.filter(
                    id__in=other_teaching_skills.values("id")
                ).exists()
            )

            learns_what_user_teaches = (
                teaching_skills.filter(
                    id__in=other_learning_skills.values("id")
                ).exists()
            )

            if (
                teaches_what_user_learns
                and learns_what_user_teaches
            ):

                matching_skills = [
                    skill.name
                    for skill in learning_skills.filter(
                        id__in=other_teaching_skills.values("id")
                    )
                ]

                reverse_matching_skills = [
                    skill.name
                    for skill in teaching_skills.filter(
                        id__in=other_learning_skills.values("id")
                    )
                ]

                total_possible = (
                    learning_skills.count()
                    +
                    teaching_skills.count()
                )

                total_matching = (
                    len(matching_skills)
                    +
                    len(reverse_matching_skills)
                )

                if total_possible > 0:

                    match_score = round(
                        (
                            total_matching
                            /
                            total_possible
                        ) * 100
                    )

                else:

                    match_score = 0

                matches.append(
                    {
                        "user_id":
                            other_user.id,

                        "name":
                            other_user.name,

                        "email":
                            other_user.email,

                        "role":
                            other_user.role,

                        "bio":
                            other_user.bio,

                        "profile_image":
                            other_user.profile_image,

                        "match_score":
                            match_score,

                        "teaches_skills":
                            matching_skills,

                        "learns_skills":
                            reverse_matching_skills,
                    }
                )

        matches.sort(
            key=lambda match:
                match["match_score"],
            reverse=True
        )

        return Response(
            {
                "user_id":
                    user.id,

                "matches":
                    matches,
            },
            status=status.HTTP_200_OK
        )

class CurrentUserProfileView(APIView):
    """
    GET   /api/users/me/
    PATCH /api/users/me/
    """

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = UserProfile.objects.get(
                user=request.user
            )

        except UserProfile.DoesNotExist:
            return Response(
                {
                    "error": "User profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = UserProfileSerializer(profile)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def patch(self, request):
        try:
            profile = UserProfile.objects.get(
                user=request.user
            )

        except UserProfile.DoesNotExist:
            return Response(
                {
                    "error": "User profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = UserProfileSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        profile = serializer.save()

        return Response(
            UserProfileSerializer(profile).data,
            status=status.HTTP_200_OK
        )

        # ---------------------------------------------
        # Extract skills separately because they are
        # ManyToMany fields.
        # ---------------------------------------------

        teaching_skills = request.data.get(
            "teaching_skills",
            None
        )

        learning_skills = request.data.get(
            "learning_skills",
            None
        )

        # ---------------------------------------------
        # Save normal profile information
        # ---------------------------------------------

        profile_data = {
            key: value
            for key, value in request.data.items()
            if key not in [
                "teaching_skills",
                "learning_skills"
            ]
        }

        serializer = UserProfileSerializer(
            profile,
            data=profile_data,
            partial=True
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        profile = serializer.save()

        # ---------------------------------------------
        # Save teaching skills
        # ---------------------------------------------

        if teaching_skills is not None:

            teaching_skill_objects = []

            for skill_name in teaching_skills:

                skill_name = str(skill_name).strip()

                if not skill_name:
                    continue

                skill, created = Skill.objects.get_or_create(
                    name=skill_name
                )

                teaching_skill_objects.append(skill)

            profile.teaching_skills.set(
                teaching_skill_objects
            )

        # ---------------------------------------------
        # Save learning skills
        # ---------------------------------------------

        if learning_skills is not None:

            learning_skill_objects = []

            for skill_name in learning_skills:

                skill_name = str(skill_name).strip()

                if not skill_name:
                    continue

                skill, created = Skill.objects.get_or_create(
                    name=skill_name
                )

                learning_skill_objects.append(skill)

            profile.learning_skills.set(
                learning_skill_objects
            )

        # ---------------------------------------------
        # Return complete updated profile
        # ---------------------------------------------

        return Response(
            UserProfileSerializer(profile).data,
            status=status.HTTP_200_OK
        )


class ConnectedProfileListCreateView(APIView):
    """
    GET  /api/users/me/profiles/
    POST /api/users/me/profiles/
    """

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:
            user = UserProfile.objects.get(
                user=request.user
            )

        except UserProfile.DoesNotExist:

            return Response(
                {
                    "error":
                        "User profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        profiles = (
            user.connected_profiles
            .all()
            .order_by("category", "platform")
        )

        serializer = ConnectedProfileSerializer(
            profiles,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def post(self, request):

        try:
            user = UserProfile.objects.get(
                user=request.user
            )

        except UserProfile.DoesNotExist:

            return Response(
                {
                    "error":
                        "User profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        data = request.data.copy()

        platform = data.get("platform")

        if not platform:

            return Response(
                {
                    "error":
                        "Platform is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        category_map = {

            "github": "coding",
            "leetcode": "coding",
            "codechef": "coding",
            "codeforces": "coding",
            "hackerrank": "coding",

            "linkedin": "professional",

            "behance": "creative",

            "instagram": "social",
            "twitter": "social",
            "facebook": "social",
            "youtube": "social",
            "discord": "social",
            "telegram": "social",
            "threads": "social",

            "website": "website",

            "other": "other",
        }

        data["category"] = category_map.get(
            platform,
            "other"
        )

        serializer = ConnectedProfileSerializer(
            data=data
        )

        if not serializer.is_valid():

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        existing_profile = (
            ConnectedProfile.objects.filter(
                user=user,
                platform=platform
            ).first()
        )

        if existing_profile:

            return Response(
                {
                    "error": (
                        f"{platform.capitalize()} "
                        "profile is already connected."
                    )
                },
                status=status.HTTP_409_CONFLICT
            )

        profile = serializer.save(
            user=user
        )

        return Response(
            ConnectedProfileSerializer(
                profile
            ).data,
            status=status.HTTP_201_CREATED
        )