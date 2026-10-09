from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import ContactMessage
from .serializers import ContactMessageSerializer

class ContactMessageCreateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        return Response(
            {"message": "Your message has been received. Thank you for contacting Coral Reef.", "id": message.id},
            status=status.HTTP_201_CREATED,
        )
