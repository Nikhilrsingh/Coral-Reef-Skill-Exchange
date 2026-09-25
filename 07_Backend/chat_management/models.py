from django.db import models
from user_management.models import UserProfile


class Conversation(models.Model):

    participant_one = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="conversations_as_one",
    )

    participant_two = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="conversations_as_two",
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "participant_one",
                    "participant_two",
                ],
                name="unique_conversation_pair",
            )
        ]
        ordering = ["-updated_at"]

    def save(self, *args, **kwargs):

        if (
            self.participant_one_id
            and self.participant_two_id
        ):
            if (
                self.participant_one_id
                > self.participant_two_id
            ):
                (
                    self.participant_one_id,
                    self.participant_two_id,
                ) = (
                    self.participant_two_id,
                    self.participant_one_id,
                )

        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.participant_one.name} ↔ "
            f"{self.participant_two.name}"
        )


class Message(models.Model):

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )

    sender = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="sent_messages",
    )

    content = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return (
            f"{self.sender.name}: "
            f"{self.content[:50]}"
        )