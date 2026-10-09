from django.test import TestCase
from rest_framework.test import APIClient
from .models import ContactMessage

class ContactMessageTests(TestCase):
    def test_create_contact_message(self):
        response = APIClient().post("/api/contact/", {
            "name": "Test User",
            "email": "test@example.com",
            "subject": "Project question",
            "message": "This is a valid contact message for testing.",
        }, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(ContactMessage.objects.count(), 1)
