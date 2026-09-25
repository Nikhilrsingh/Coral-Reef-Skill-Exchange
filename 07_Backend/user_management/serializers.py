from rest_framework import serializers

from .models import UserProfile, ConnectedProfile
from skill_management.models import Skill


class SkillBasicSerializer(serializers.ModelSerializer):

    class Meta:
        model = Skill
        fields = [
            "id",
            "name",
            "category",
        ]


class UserProfileSerializer(serializers.ModelSerializer):

    teaching_skills = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        write_only=True
    )

    learning_skills = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        write_only=True
    )

    teaching_skills_data = SkillBasicSerializer(
        source="teaching_skills",
        many=True,
        read_only=True
    )

    learning_skills_data = SkillBasicSerializer(
        source="learning_skills",
        many=True,
        read_only=True
    )

    class Meta:
        model = UserProfile

        fields = [
            "id",
            "name",
            "email",
            "role",
            "bio",
            "profile_image",

            "teaching_skills",
            "learning_skills",

            "teaching_skills_data",
            "learning_skills_data",

            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "teaching_skills_data",
            "learning_skills_data",
            "created_at",
            "updated_at",
        ]

    def update(self, instance, validated_data):

        teaching_skill_names = validated_data.pop(
            "teaching_skills",
            None
        )

        learning_skill_names = validated_data.pop(
            "learning_skills",
            None
        )

        instance = super().update(
            instance,
            validated_data
        )

        if teaching_skill_names is not None:

            teaching_skills = []

            for name in teaching_skill_names:

                skill, created = Skill.objects.get_or_create(
                    name=name.strip()
                )

                teaching_skills.append(skill)

            instance.teaching_skills.set(
                teaching_skills
            )

        if learning_skill_names is not None:

            learning_skills = []

            for name in learning_skill_names:

                skill, created = Skill.objects.get_or_create(
                    name=name.strip()
                )

                learning_skills.append(skill)

            instance.learning_skills.set(
                learning_skills
            )

        return instance


class ConnectedProfileSerializer(serializers.ModelSerializer):

    class Meta:

        model = ConnectedProfile

        fields = [
            "id",
            "platform",
            "category",
            "username",
            "profile_url",
            "is_connected",
            "profile_data",
            "last_synced_at",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "profile_data",
            "last_synced_at",
            "created_at",
            "updated_at",
        ]