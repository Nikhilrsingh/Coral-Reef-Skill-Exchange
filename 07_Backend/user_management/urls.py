from django.urls import path

from .views import (
    UserProfileListCreateView,
    UserSkillsView,
    UserMatchesView,
    CurrentUserProfileView,
    ConnectedProfileListCreateView,
)


urlpatterns = [
    path(
        "",
        UserProfileListCreateView.as_view(),
        name="user-list-create",
    ),

    path(
        "me/",
        CurrentUserProfileView.as_view(),
        name="current-user-profile",
    ),

    path(
    "me/profiles/",
    ConnectedProfileListCreateView.as_view(),
    name="connected-profile-list-create",
),

    path(
        "<int:user_id>/skills/",
        UserSkillsView.as_view(),
        name="user-skills",
    ),

    path(
        "<int:user_id>/matches/",
        UserMatchesView.as_view(),
        name="user-matches",
    ),
]