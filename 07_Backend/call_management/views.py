from django.db.models import Q
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from user_management.models import UserProfile
from chat_management.models import Conversation
from .models import CallSession, CallSignal


def current_profile(request):
    try:
        return UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        return None


def call_payload(call):
    return {
        "id": call.id,
        "conversation_id": call.conversation_id,
        "caller": {"id": call.caller_id, "name": call.caller.name},
        "receiver": {"id": call.receiver_id, "name": call.receiver.name},
        "call_type": call.call_type,
        "status": call.status,
        "created_at": call.created_at.isoformat(),
    }


def get_call_for_profile(call_id, profile):
    if profile is None:
        return None
    return CallSession.objects.select_related("caller", "receiver", "conversation").filter(
        id=call_id
    ).filter(Q(caller=profile) | Q(receiver=profile)).first()


class ConversationCallCreateView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):
        profile = current_profile(request)
        if profile is None:
            return Response({"detail": "User profile not found."}, status=404)
        conversation = Conversation.objects.filter(id=conversation_id).filter(
            Q(participant_one=profile) | Q(participant_two=profile)
        ).first()
        if conversation is None:
            return Response({"detail": "Conversation not found or access denied."}, status=404)
        receiver = conversation.participant_two if conversation.participant_one_id == profile.id else conversation.participant_one
        call_type = request.data.get("call_type", "audio")
        if call_type not in ("audio", "video"):
            return Response({"detail": "call_type must be audio or video."}, status=400)
        # Keep one ringing/accepted call per conversation at a time.
        active = CallSession.objects.filter(
            conversation=conversation, status__in=["ringing", "accepted"]
        ).first()
        if active:
            return Response({"detail": "A call is already active in this conversation."}, status=409)
        call = CallSession.objects.create(
            conversation=conversation, caller=profile, receiver=receiver, call_type=call_type
        )
        return Response(call_payload(call), status=status.HTTP_201_CREATED)


class IncomingCallsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = current_profile(request)
        if profile is None:
            return Response({"detail": "User profile not found."}, status=404)
        calls = CallSession.objects.filter(receiver=profile, status="ringing").select_related("caller", "receiver", "conversation")[:10]
        return Response([call_payload(call) for call in calls])


class CallSignalsView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, call_id):
        profile = current_profile(request)
        call = get_call_for_profile(call_id, profile)
        if call is None:
            return Response({"detail": "Call not found or access denied."}, status=404)
        try:
            after_id = max(0, int(request.query_params.get("after", "0")))
        except ValueError:
            after_id = 0
        signals = call.signals.filter(id__gt=after_id).exclude(sender=profile).select_related("sender")
        return Response({
            "call": call_payload(call),
            "signals": [{"id": s.id, "kind": s.kind, "payload": s.payload, "sender_id": s.sender_id} for s in signals],
        })

    def post(self, request, call_id):
        profile = current_profile(request)
        call = get_call_for_profile(call_id, profile)
        if call is None:
            return Response({"detail": "Call not found or access denied."}, status=404)
        if call.status not in ("ringing", "accepted"):
            return Response({"detail": "This call is no longer active."}, status=409)
        kind = request.data.get("kind")
        payload = request.data.get("payload")
        if kind not in ("offer", "answer", "ice") or not isinstance(payload, dict):
            return Response({"detail": "A valid kind and JSON payload are required."}, status=400)
        if kind == "offer" and profile.id != call.caller_id:
            return Response({"detail": "Only the caller can send the offer."}, status=403)
        if kind == "answer" and profile.id != call.receiver_id:
            return Response({"detail": "Only the receiver can send the answer."}, status=403)
        signal = CallSignal.objects.create(call=call, sender=profile, kind=kind, payload=payload)
        return Response({"id": signal.id}, status=201)


class CallActionView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, call_id):
        profile = current_profile(request)
        call = get_call_for_profile(call_id, profile)
        if call is None:
            return Response({"detail": "Call not found or access denied."}, status=404)
        action = request.data.get("action")
        if action == "accept":
            if profile.id != call.receiver_id or call.status != "ringing":
                return Response({"detail": "Only the recipient can accept a ringing call."}, status=400)
            call.status = "accepted"
        elif action == "reject":
            if profile.id != call.receiver_id or call.status != "ringing":
                return Response({"detail": "Only the recipient can decline a ringing call."}, status=400)
            call.status = "rejected"
        elif action == "end":
            if call.status not in ("ringing", "accepted"):
                return Response({"detail": "Call has already ended."}, status=409)
            call.status = "ended"
        else:
            return Response({"detail": "action must be accept, reject, or end."}, status=400)
        call.save(update_fields=["status", "updated_at"])
        return Response(call_payload(call))
