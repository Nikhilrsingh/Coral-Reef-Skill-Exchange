from django.urls import path
from .views import RoadmapListCreateView, RoadmapDetailView, RoadmapStepDetailView

urlpatterns = [
    path("", RoadmapListCreateView.as_view(), name="roadmap-list-create"),
    path("<int:roadmap_id>/", RoadmapDetailView.as_view(), name="roadmap-detail"),
    path("<int:roadmap_id>/steps/<int:step_id>/", RoadmapStepDetailView.as_view(), name="roadmap-step-detail"),
]
