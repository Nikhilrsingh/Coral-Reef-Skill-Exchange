from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path(
        "admin/",
        admin.site.urls
    ),

    path(
        "api/users/",
        include("user_management.urls")
    ),

    path(
        "api/requests/",
        include("connection_management.urls")
    ),

    path(
    "api/auth/",
    include("authentication.urls")
),

path(
    "api/skills/",
    include("skill_management.urls")
),

path("api/chat/", include("chat_management.urls")),

]