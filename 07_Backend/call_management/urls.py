from django.urls import path
from .views import (
    CallActionView,
    CallSignalsView,
    ConversationCallCreateView,
    IncomingCallsView,
)

urlpatterns = [
    path("conversations/<int:conversation_id>/calls/", ConversationCallCreateView.as_view(), name="conversation-call-create"),
    path("calls/incoming/", IncomingCallsView.as_view(), name="incoming-calls"),
    path("calls/<int:call_id>/signals/", CallSignalsView.as_view(), name="call-signals"),
    path("calls/<int:call_id>/action/", CallActionView.as_view(), name="call-action"),
]
