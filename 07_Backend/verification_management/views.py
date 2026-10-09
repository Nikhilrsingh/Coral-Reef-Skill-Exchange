from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from user_management.models import UserProfile
from skill_management.models import Skill
from .models import VerificationRequest, VerificationQuestion, VerificationAttempt
from .serializers import VerificationRequestSerializer, VerificationQuestionSerializer, VerificationAttemptSerializer


def profile_for(request):
    return get_object_or_404(UserProfile, user=request.user)


def seed_questions(skill):
    if VerificationQuestion.objects.filter(skill=skill).exists():
        return
    templates = {
        "python": [
            ("Which keyword defines a function in Python?", ["func", "def", "function", "define"], "def"),
            ("Which collection stores key-value pairs?", ["list", "tuple", "set", "dictionary"], "dictionary"),
            ("Which statement handles exceptions?", ["catch", "try/except", "handle", "error"], "try/except"),
            ("What does len() return for a list?", ["Last index", "Number of elements", "Memory size", "Type"], "Number of elements"),
            ("Which symbol starts a Python comment?", ["//", "/*", "#", "--"], "#"),
        ],
        "javascript": [
            ("Which keyword declares a block-scoped variable?", ["var", "let", "define", "dim"], "let"),
            ("Which method converts JSON text into an object?", ["JSON.parse()", "JSON.stringify()", "JSON.object()", "JSON.decode()"], "JSON.parse()"),
            ("Which value represents intentional absence?", ["empty", "null", "voided", "none"], "null"),
            ("Which operator checks value and type equality?", ["==", "=", "===", "!="], "==="),
            ("Which API selects an element by its id?", ["getElementById", "queryById", "selectId", "findId"], "getElementById"),
        ],
        "web design": [
            ("Which language defines webpage structure?", ["CSS", "HTML", "SQL", "Python"], "HTML"),
            ("Which language controls visual styling?", ["HTML", "CSS", "JSON", "SQL"], "CSS"),
            ("Which property changes text color in CSS?", ["font", "color", "text-style", "foreground"], "color"),
            ("Which tag creates a hyperlink?", ["<link>", "<a>", "<href>", "<url>"], "<a>"),
            ("Which CSS layout system is designed for one-dimensional layouts?", ["Grid", "Flexbox", "Float", "Table"], "Flexbox"),
        ],
    }
    questions = templates.get(skill.name.lower(), [
        (f"What is an important principle when learning {skill.name}?", ["Regular practice", "Avoiding practice", "Never reviewing", "Ignoring feedback"], "Regular practice"),
        (f"Which approach best demonstrates practical {skill.name} knowledge?", ["Building a project", "Memorizing without practice", "Avoiding examples", "Skipping fundamentals"], "Building a project"),
        (f"What helps improve {skill.name} over time?", ["Feedback and practice", "No repetition", "Avoiding mistakes", "Never testing"], "Feedback and practice"),
        (f"What should a learner do before tackling advanced {skill.name} topics?", ["Understand fundamentals", "Skip basics", "Avoid exercises", "Avoid documentation"], "Understand fundamentals"),
        (f"Which activity best validates applied {skill.name} knowledge?", ["Solving a relevant task", "Reading only", "Skipping practice", "Ignoring results"], "Solving a relevant task"),
    ])
    for question, options, answer in questions:
        VerificationQuestion.objects.create(skill=skill, question=question, options=options, correct_answer=answer)


class VerificationRequestListCreateView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = profile_for(request)
        qs = VerificationRequest.objects.filter(user=profile).select_related("skill")
        return Response(VerificationRequestSerializer(qs, many=True).data)

    def post(self, request):
        profile = profile_for(request)
        skill_name = str(request.data.get("skill", "")).strip()
        experience = str(request.data.get("experience", "")).strip()
        evidence = str(request.data.get("evidence_url", "")).strip()
        if not skill_name or not experience:
            return Response({"detail": "Skill and experience are required."}, status=400)
        skill = Skill.objects.filter(name__iexact=skill_name).first()
        if not skill:
            skill = Skill.objects.create(name=skill_name)
        if not profile.teaching_skills.filter(id=skill.id).exists():
            return Response({"detail": "The selected skill must be in your teaching skills before requesting verification."}, status=400)
        existing = VerificationRequest.objects.filter(user=profile, skill=skill, status="pending").first()
        if existing:
            return Response(VerificationRequestSerializer(existing).data, status=200)
        verification = VerificationRequest.objects.create(
            user=profile, skill=skill, experience=experience, evidence_url=evidence
        )
        seed_questions(skill)
        return Response(VerificationRequestSerializer(verification).data, status=201)


class VerificationQuestionListView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, verification_id):
        profile = profile_for(request)
        verification = get_object_or_404(VerificationRequest, id=verification_id, user=profile)
        seed_questions(verification.skill)
        questions = VerificationQuestion.objects.filter(skill=verification.skill).order_by("id")[:5]
        return Response({
            "verification": VerificationRequestSerializer(verification).data,
            "questions": VerificationQuestionSerializer(questions, many=True).data,
        })


class VerificationSubmitView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, verification_id):
        profile = profile_for(request)
        verification = get_object_or_404(VerificationRequest, id=verification_id, user=profile)
        if verification.status == "verified":
            return Response({"detail": "This skill is already verified.", "verification": VerificationRequestSerializer(verification).data}, status=400)
        seed_questions(verification.skill)
        questions = list(VerificationQuestion.objects.filter(skill=verification.skill).order_by("id")[:5])
        answers = request.data.get("answers", {})
        if not isinstance(answers, dict):
            return Response({"detail": "answers must be an object."}, status=400)
        correct = sum(1 for q in questions if str(answers.get(str(q.id), "")) == q.correct_answer)
        score = round(correct / len(questions) * 100) if questions else 0
        passed = score >= 60
        attempt = VerificationAttempt.objects.create(
            request=verification, score=score, total_questions=len(questions),
            answers=answers, passed=passed
        )
        verification.score = score
        verification.status = "verified" if passed else "rejected"
        verification.save(update_fields=["score", "status", "updated_at"])
        return Response({
            "verification": VerificationRequestSerializer(verification).data,
            "attempt": VerificationAttemptSerializer(attempt).data,
            "correct_answers": correct,
        }, status=201)


class VerificationAttemptsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, verification_id):
        profile = profile_for(request)
        verification = get_object_or_404(VerificationRequest, id=verification_id, user=profile)
        return Response(VerificationAttemptSerializer(verification.attempts.all(), many=True).data)
