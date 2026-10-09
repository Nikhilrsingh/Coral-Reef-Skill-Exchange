from django.urls import path
from .views import (
    VerificationRequestListCreateView,
    VerificationQuestionListView,
    VerificationSubmitView,
    VerificationAttemptsView,
)

urlpatterns = [
    path("", VerificationRequestListCreateView.as_view(), name="verification-list-create"),
    path("<int:verification_id>/questions/", VerificationQuestionListView.as_view(), name="verification-questions"),
    path("<int:verification_id>/submit/", VerificationSubmitView.as_view(), name="verification-submit"),
    path("<int:verification_id>/attempts/", VerificationAttemptsView.as_view(), name="verification-attempts"),
]
