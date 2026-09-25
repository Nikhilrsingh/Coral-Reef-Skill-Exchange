from django.db.models import Q

from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from user_management.models import UserProfile
from connection_management.models import SkillExchangeRequest

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


def get_current_profile(request):
    return UserProfile.objects.get(user=request.user)


def get_conversation_for_users(profile_one, profile_two):
    return Conversation.objects.filter(
        Q(
            participant_one=profile_one,
            participant_two=profile_two,
        )
        |
        Q(
            participant_one=profile_two,
            participant_two=profile_one,
        )
    ).first()


class ConversationListCreateView(APIView):

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = get_current_profile(request)
        except UserProfile.DoesNotExist:
            return Response(
                {"detail": "User profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        conversations = Conversation.objects.filter(
            Q(participant_one=profile)
            |
            Q(participant_two=profile)
        ).select_related(
            "participant_one",
            "participant_two",
        )

        serializer = ConversationSerializer(
            conversations,
            many=True,
            context={
                "current_profile": profile
            },
        )
            
            
        

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        try:
            profile = get_current_profile(request)
        except UserProfile.DoesNotExist:
            return Response(
                {"detail": "User profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        receiver_id = request.data.get("receiver")

        if not receiver_id:
            return Response(
                {"detail": "Receiver is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            receiver = UserProfile.objects.get(
                id=receiver_id
            )
        except UserProfile.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if receiver == profile:
            return Response(
                {
                    "detail": (
                        "You cannot start a conversation "
                        "with yourself."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        connection_exists = SkillExchangeRequest.objects.filter(
            status="accepted"
        ).filter(
            Q(sender=profile, receiver=receiver)
            |
            Q(sender=receiver, receiver=profile)
        ).exists()

        if not connection_exists:
            return Response(
                {
                    "detail": (
                        "You can only start a conversation "
                        "with an accepted connection."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if profile.id < receiver.id:
            participant_one = profile
            participant_two = receiver
        else:
            participant_one = receiver
            participant_two = profile


        conversation, created = Conversation.objects.get_or_create(
            participant_one=participant_one,
            participant_two=participant_two,
        )


        if created:
            response_status = status.HTTP_201_CREATED
        else:
            response_status = status.HTTP_200_OK

        serializer = ConversationSerializer(
            conversation,
            context={
                "current_profile": profile
             },
        )
            
        

        return Response(
            serializer.data,
            status=response_status,
        )


class ConversationMessageListCreateView(APIView):

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        try:
            profile = get_current_profile(request)
        except UserProfile.DoesNotExist:
            return Response(
                {"detail": "User profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            conversation = Conversation.objects.get(
                id=conversation_id
            )
        except Conversation.DoesNotExist:
            return Response(
                {"detail": "Conversation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if profile not in [
            conversation.participant_one,
            conversation.participant_two,
        ]:
            return Response(
                {
                    "detail": (
                        "You do not have access "
                        "to this conversation."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        messages = conversation.messages.select_related(
            "sender"
        ).all()

        serializer = MessageSerializer(
            messages,
            many=True,
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def post(self, request, conversation_id):
        try:
            profile = get_current_profile(request)
        except UserProfile.DoesNotExist:
            return Response(
                {"detail": "User profile not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            conversation = Conversation.objects.get(
                id=conversation_id
            )
        except Conversation.DoesNotExist:
            return Response(
                {"detail": "Conversation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if profile not in [
            conversation.participant_one,
            conversation.participant_two,
        ]:
            return Response(
                {
                    "detail": (
                        "You do not have access "
                        "to this conversation."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        content = str(
            request.data.get("content", "")
        ).strip()

        if not content:
            return Response(
                {"detail": "Message cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        message = Message.objects.create(
            conversation=conversation,
            sender=profile,
            content=content,
        )

        conversation.save(
            update_fields=["updated_at"]
        )

        serializer = MessageSerializer(
            message
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )