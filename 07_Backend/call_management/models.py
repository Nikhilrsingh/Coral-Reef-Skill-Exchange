from django.conf import settings
from django.db import models
from user_management.models import UserProfile
from chat_management.models import Conversation


class CallSession(models.Model):
    TYPE_CHOICES = [("audio", "Audio"), ("video", "Video")]
    STATUS_CHOICES = [
        ("ringing", "Ringing"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("ended", "Ended"),
    ]

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="calls")
    caller = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="calls_started")
    receiver = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="calls_received")
    call_type = models.CharField(max_length=8, choices=TYPE_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="ringing")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]


class CallSignal(models.Model):
    KIND_CHOICES = [("offer", "Offer"), ("answer", "Answer"), ("ice", "ICE candidate")]
    call = models.ForeignKey(CallSession, on_delete=models.CASCADE, related_name="signals")
    sender = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name="call_signals")
    kind = models.CharField(max_length=8, choices=KIND_CHOICES)
    payload = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]
