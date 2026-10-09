from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [
        ("user_management", "0006_alter_connectedprofile_options_and_more"),
    ]
    operations = [
        migrations.CreateModel(
            name="Roadmap",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("goal", models.CharField(max_length=200)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="roadmaps", to="user_management.userprofile")),
            ],
            options={"ordering": ["-updated_at"]},
        ),
        migrations.CreateModel(
            name="RoadmapStep",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("step_number", models.PositiveIntegerField()),
                ("title", models.CharField(max_length=200)),
                ("description", models.TextField()),
                ("completed", models.BooleanField(default=False)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("roadmap", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="steps", to="roadmap_management.roadmap")),
            ],
            options={"ordering": ["step_number"]},
        ),
        migrations.AddConstraint(
            model_name="roadmapstep",
            constraint=models.UniqueConstraint(fields=("roadmap", "step_number"), name="unique_roadmap_step"),
        ),
    ]
