from django.db import models

from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from user_management.models import UserProfile

from .models import SkillExchangeRequest
from .serializers import SkillExchangeRequestSerializer


class SkillExchangeRequestListCreateView(APIView):
    """
    GET  /api/requests/
    POST /api/requests/
    """

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            current_profile = UserProfile.objects.get(
                user=request.user
            )
        except UserProfile.DoesNotExist:
            return Response(
                {
                    "error": "User profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        requests = SkillExchangeRequest.objects.filter(
            models.Q(sender=current_profile)
            | models.Q(receiver=current_profile)
        ).order_by(
            "-created_at"
        )

        serializer = SkillExchangeRequestSerializer(
            requests,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def post(self, request):
        sender_user = request.user
        receiver_id = request.data.get("receiver")

        if not receiver_id:
            return Response(
                {
                    "error": "receiver is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            sender = UserProfile.objects.get(
                user=sender_user
            )
        except UserProfile.DoesNotExist:
            return Response(
                {
                    "error": "Sender profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if str(sender.id) == str(receiver_id):
            return Response(
                {
                    "error": "You cannot send a request to yourself."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            receiver = UserProfile.objects.get(
                id=receiver_id
            )
        except UserProfile.DoesNotExist:
            return Response(
                {
                    "error": "Receiver not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        existing_request = SkillExchangeRequest.objects.filter(
            sender=sender,
            receiver=receiver,
            status="pending"
        ).first()

        if existing_request:
            return Response(
                {
                    "error": "A request already exists.",
                    "request_id": existing_request.id,
                    "status": existing_request.status,
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        skill_request = SkillExchangeRequest.objects.create(
            sender=sender,
            receiver=receiver
        )

        return Response(
            SkillExchangeRequestSerializer(
                skill_request
            ).data,
            status=status.HTTP_201_CREATED
        )


class SkillExchangeRequestDetailView(APIView):
    """
    PATCH /api/requests/<request_id>/
    """

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, request_id):
        try:
            skill_request = SkillExchangeRequest.objects.get(
                id=request_id
            )
        except SkillExchangeRequest.DoesNotExist:
            return Response(
                {
                    "error": "Request not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        current_user = request.user

        try:
            current_profile = UserProfile.objects.get(
                user=current_user
            )
        except UserProfile.DoesNotExist:
            return Response(
                {
                    "error": "User profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if current_profile.id != skill_request.receiver_id:
            return Response(
                {
                    "error": (
                        "Only the receiver can "
                        "accept or reject this request."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        new_status = request.data.get("status")

        if new_status not in ["accepted", "rejected"]:
            return Response(
                {
                    "error": (
                        "Status must be either "
                        "'accepted' or 'rejected'."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if skill_request.status != "pending":
            return Response(
                {
                    "error": (
                        "Only pending requests "
                        "can be updated."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        skill_request.status = new_status
        skill_request.save()

        return Response(
            SkillExchangeRequestSerializer(
                skill_request
            ).data,
            status=status.HTTP_200_OK
        )