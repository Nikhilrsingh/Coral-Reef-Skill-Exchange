from rest_framework import serializers

from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):

    sender_name = serializers.CharField(
        source="sender.name",
        read_only=True,
    )

    class Meta:
        model = Message

        fields = [
            "id",
            "sender",
            "sender_name",
            "content",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "sender",
            "sender_name",
            "created_at",
        ]


class ChatUserSerializer(serializers.Serializer):

    id = serializers.IntegerField(
        read_only=True
    )

    name = serializers.CharField(
        read_only=True
    )

    role = serializers.CharField(
        read_only=True
    )

    profile_image = serializers.CharField(
        read_only=True
    )


class ConversationSerializer(serializers.ModelSerializer):

    other_user = serializers.SerializerMethodField()

    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation

        fields = [
            "id",
            "other_user",
            "last_message",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "other_user",
            "last_message",
            "created_at",
            "updated_at",
        ]

    def get_other_user(self, obj):

        current_profile = self.context.get(
            "current_profile"
        )

        if current_profile is None:
            return None

        if obj.participant_one_id == current_profile.id:
            other_user = obj.participant_two
        else:
            other_user = obj.participant_one

        return ChatUserSerializer(
            {
                "id": other_user.id,
                "name": other_user.name,
                "role": other_user.role,
                "profile_image": other_user.profile_image,
            }
        ).data

    def get_last_message(self, obj):

        message = (
            obj.messages
            .select_related("sender")
            .order_by("-created_at")
            .first()
        )

        if not message:
            return None

        return MessageSerializer(message).data