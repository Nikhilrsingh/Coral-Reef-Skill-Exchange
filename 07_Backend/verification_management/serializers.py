from rest_framework import serializers
from .models import VerificationRequest, VerificationQuestion, VerificationAttempt


class VerificationQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationQuestion
        fields = ["id", "question", "options"]


class VerificationRequestSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source="skill.name", read_only=True)
    class Meta:
        model = VerificationRequest
        fields = ["id", "skill", "skill_name", "experience", "evidence_url", "status", "score", "created_at", "updated_at"]
        read_only_fields = ["id", "skill_name", "status", "score", "created_at", "updated_at"]


class VerificationAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationAttempt
        fields = ["id", "score", "total_questions", "passed", "created_at"]
