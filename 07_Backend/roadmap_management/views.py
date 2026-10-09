from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from user_management.models import UserProfile
from .models import Roadmap, RoadmapStep
from .serializers import RoadmapSerializer


def current_profile(request):
    return get_object_or_404(UserProfile, user=request.user)


def build_steps(goal):
    normalized = goal.lower()
    if any(x in normalized for x in ["python", "programming", "coding", "javascript", "java", "c++"]):
        stages = [
            ("Understand the fundamentals", f"Learn the core concepts, syntax and terminology of {goal}."),
            ("Practice core concepts", f"Strengthen your {goal} knowledge with exercises and small challenges."),
            ("Build a practical project", f"Create a real project that applies your {goal} skills."),
            ("Review and improve", f"Get feedback, fix weaknesses and deepen your {goal} knowledge."),
        ]
    elif any(x in normalized for x in ["web", "frontend", "backend", "react", "design", "ui", "ux"]):
        stages = [
            ("Understand the foundations", f"Learn the fundamental concepts and tools used in {goal}."),
            ("Practice through small tasks", f"Build small exercises to strengthen your {goal} skills."),
            ("Build a practical project", f"Create a complete project using the concepts you learned in {goal}."),
            ("Review and improve", f"Get feedback, improve the project and continue developing your {goal} skills."),
        ]
    else:
        stages = [
            ("Understand the basics", f"Learn the fundamentals and key concepts of {goal}."),
            ("Practice the fundamentals", f"Practice important {goal} concepts through exercises and examples."),
            ("Build a practical project", f"Apply your knowledge by creating a practical {goal} project."),
            ("Review and improve", f"Review your progress, get feedback and continue improving your {goal} skills."),
        ]
    return stages


class RoadmapListCreateView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = current_profile(request)
        roadmaps = Roadmap.objects.filter(user=profile).prefetch_related("steps")
        return Response(RoadmapSerializer(roadmaps, many=True).data)

    def post(self, request):
        profile = current_profile(request)
        goal = str(request.data.get("goal", "")).strip()
        if not goal:
            return Response({"detail": "A learning goal is required."}, status=400)
        if len(goal) > 200:
            return Response({"detail": "Learning goal must be 200 characters or fewer."}, status=400)

        roadmap = Roadmap.objects.create(user=profile, goal=goal)
        for number, (title, description) in enumerate(build_steps(goal), start=1):
            RoadmapStep.objects.create(
                roadmap=roadmap,
                step_number=number,
                title=title,
                description=description,
            )
        return Response(RoadmapSerializer(roadmap).data, status=status.HTTP_201_CREATED)


class RoadmapDetailView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_object(self, request, roadmap_id):
        profile = current_profile(request)
        return get_object_or_404(
            Roadmap.objects.prefetch_related("steps"),
            id=roadmap_id,
            user=profile,
        )

    def get(self, request, roadmap_id):
        return Response(RoadmapSerializer(self.get_object(request, roadmap_id)).data)

    def delete(self, request, roadmap_id):
        roadmap = self.get_object(request, roadmap_id)
        roadmap.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RoadmapStepDetailView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, roadmap_id, step_id):
        roadmap = RoadmapDetailView().get_object(request, roadmap_id)
        step = get_object_or_404(RoadmapStep, id=step_id, roadmap=roadmap)
        if "completed" not in request.data:
            return Response({"detail": "completed is required."}, status=400)
        completed = bool(request.data["completed"])
        step.completed = completed
        step.completed_at = timezone.now() if completed else None
        step.save(update_fields=["completed", "completed_at"])
        roadmap.save(update_fields=["updated_at"])
        return Response(RoadmapSerializer(roadmap).data)
