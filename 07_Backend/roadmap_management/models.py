from django.db import models
from user_management.models import UserProfile


class Roadmap(models.Model):
    user = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="roadmaps",
    )
    goal = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.user.name} - {self.goal}"


class RoadmapStep(models.Model):
    roadmap = models.ForeignKey(
        Roadmap,
        on_delete=models.CASCADE,
        related_name="steps",
    )
    step_number = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField()
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["step_number"]
        constraints = [
            models.UniqueConstraint(
                fields=["roadmap", "step_number"],
                name="unique_roadmap_step",
            )
        ]

    def __str__(self):
        return f"{self.roadmap.goal} - Step {self.step_number}"
