from django.db import models


class UserProfile(models.Model):

    user = models.OneToOneField(
        "auth.User",
        on_delete=models.CASCADE,
        related_name="profile",
        null=True,
        blank=True,
    )

    ROLE_CHOICES = [
        ("student", "Student"),
        ("teacher", "Teacher"),
        ("professional", "Professional"),
    ]

    name = models.CharField(
        max_length=100
    )

    email = models.EmailField(
        unique=True
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="student"
    )

    bio = models.TextField(
        blank=True
    )

    profile_image = models.URLField(
        blank=True
    )

    teaching_skills = models.ManyToManyField(
        "skill_management.Skill",
        related_name="teachers",
        blank=True,
    )

    learning_skills = models.ManyToManyField(
        "skill_management.Skill",
        related_name="learners",
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.name


class ConnectedProfile(models.Model):

    PLATFORM_CHOICES = [
        ("github", "GitHub"),
        ("linkedin", "LinkedIn"),
        ("leetcode", "LeetCode"),
        ("codechef", "CodeChef"),
        ("codeforces", "Codeforces"),
        ("hackerrank", "HackerRank"),
        ("behance", "Behance"),
        ("website", "Personal Website"),

        ("instagram", "Instagram"),
        ("twitter", "X / Twitter"),
        ("facebook", "Facebook"),
        ("youtube", "YouTube"),
        ("discord", "Discord"),
        ("telegram", "Telegram"),
        ("threads", "Threads"),

        ("other", "Other"),
    ]

    CATEGORY_CHOICES = [
        ("professional", "Professional"),
        ("coding", "Coding"),
        ("creative", "Creative"),
        ("social", "Social"),
        ("website", "Website"),
        ("other", "Other"),
    ]

    user = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="connected_profiles"
    )

    platform = models.CharField(
        max_length=30,
        choices=PLATFORM_CHOICES
    )

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="other"
    )

    username = models.CharField(
        max_length=150,
        blank=True
    )

    profile_url = models.URLField(
        blank=True
    )

    is_connected = models.BooleanField(
        default=False
    )

    profile_data = models.JSONField(
        default=dict,
        blank=True
    )

    last_synced_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:

        constraints = [
            models.UniqueConstraint(
                fields=["user", "platform"],
                name="unique_user_platform"
            )
        ]

        ordering = ["category", "platform"]

    def __str__(self):

        return (
            f"{self.user.name} - "
            f"{self.platform}"
        )