from rest_framework import serializers

from .models import SkillExchangeRequest


class SkillExchangeRequestSerializer(
    serializers.ModelSerializer
):

    sender_name = serializers.CharField(
        source="sender.name",
        read_only=True
    )

    receiver_name = serializers.CharField(
        source="receiver.name",
        read_only=True
    )

    class Meta:
        model = SkillExchangeRequest

        fields = [
            "id",
            "sender",
            "sender_name",
            "receiver",
            "receiver_name",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "sender_name",
            "receiver_name",
            "status",
            "created_at",
            "updated_at",
        ]