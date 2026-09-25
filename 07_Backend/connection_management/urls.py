from django.urls import path

from .views import (
    SkillExchangeRequestListCreateView,
    SkillExchangeRequestDetailView,
)


urlpatterns = [
    path(
        "",
        SkillExchangeRequestListCreateView.as_view(),
        name="request-list-create",
    ),

    path(
        "<int:request_id>/",
        SkillExchangeRequestDetailView.as_view(),
        name="request-detail",
    ),
]