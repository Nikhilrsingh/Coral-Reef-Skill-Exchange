from rest_framework import serializers
from .models import Roadmap, RoadmapStep


class RoadmapStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoadmapStep
        fields = [
            "id",
            "step_number",
            "title",
            "description",
            "completed",
            "completed_at",
        ]
        read_only_fields = ["id", "completed_at"]


class RoadmapSerializer(serializers.ModelSerializer):
    steps = RoadmapStepSerializer(many=True, read_only=True)
    completed_steps = serializers.SerializerMethodField()
    total_steps = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Roadmap
        fields = [
            "id",
            "goal",
            "created_at",
            "updated_at",
            "steps",
            "completed_steps",
            "total_steps",
            "progress_percentage",
        ]

    def get_completed_steps(self, obj):
        return obj.steps.filter(completed=True).count()

    def get_total_steps(self, obj):
        return obj.steps.count()

    def get_progress_percentage(self, obj):
        total = obj.steps.count()
        if not total:
            return 0
        return round(obj.steps.filter(completed=True).count() / total * 100)
