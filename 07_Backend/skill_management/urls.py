from django.urls import path

from .views import SkillListCreateView


urlpatterns = [
    path(
        "",
        SkillListCreateView.as_view(),
        name="skill-list-create",
    ),
]