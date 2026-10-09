from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [
        ("skill_management", "0001_initial"),
        ("user_management", "0006_alter_connectedprofile_options_and_more"),
    ]
    operations = [
        migrations.CreateModel(
            name="VerificationRequest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("experience", models.TextField()),
                ("evidence_url", models.URLField(blank=True)),
                ("status", models.CharField(choices=[("pending","Pending"),("verified","Verified"),("rejected","Rejected")], default="pending", max_length=20)),
                ("score", models.PositiveIntegerField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("skill", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="verification_requests", to="skill_management.skill")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="verification_requests", to="user_management.userprofile")),
            ],
            options={"ordering":["-created_at"]},
        ),
        migrations.CreateModel(
            name="VerificationQuestion",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("question", models.TextField()),
                ("options", models.JSONField(default=list)),
                ("correct_answer", models.CharField(max_length=255)),
                ("explanation", models.TextField(blank=True)),
                ("skill", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="verification_questions", to="skill_management.skill")),
            ],
        ),
        migrations.CreateModel(
            name="VerificationAttempt",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("score", models.PositiveIntegerField()),
                ("total_questions", models.PositiveIntegerField()),
                ("answers", models.JSONField(default=dict)),
                ("passed", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("request", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="attempts", to="verification_management.verificationrequest")),
            ],
            options={"ordering":["-created_at"]},
        ),
    ]
