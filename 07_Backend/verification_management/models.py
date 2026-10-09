from django.db import models
from user_management.models import UserProfile
from skill_management.models import Skill


class VerificationRequest(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("verified", "Verified"),
        ("rejected", "Rejected"),
    ]
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="verification_requests")
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="verification_requests")
    experience = models.TextField()
    evidence_url = models.URLField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    score = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.name} - {self.skill.name} ({self.status})"


class VerificationQuestion(models.Model):
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="verification_questions")
    question = models.TextField()
    options = models.JSONField(default=list)
    correct_answer = models.CharField(max_length=255)
    explanation = models.TextField(blank=True)

    def __str__(self):
        return f"{self.skill.name}: {self.question[:60]}"


class VerificationAttempt(models.Model):
    request = models.ForeignKey(VerificationRequest, on_delete=models.CASCADE, related_name="attempts")
    score = models.PositiveIntegerField()
    total_questions = models.PositiveIntegerField()
    answers = models.JSONField(default=dict)
    passed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
