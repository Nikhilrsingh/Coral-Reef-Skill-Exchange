from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Skill
from .serializers import SkillSerializer


class SkillListCreateView(APIView):
    """
    GET  /api/skills/
    POST /api/skills/
    """

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]

        return [IsAuthenticated()]

    authentication_classes = [TokenAuthentication]

    def get(self, request):
        skills = Skill.objects.all().order_by("name")

        serializer = SkillSerializer(
            skills,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def post(self, request):
        serializer = SkillSerializer(
            data=request.data
        )

        if serializer.is_valid():
            skill = serializer.save()

            return Response(
                SkillSerializer(skill).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )