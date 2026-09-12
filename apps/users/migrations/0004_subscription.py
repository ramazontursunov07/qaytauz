import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('users', '0003_blockeduser'),
    ]

    operations = [
        migrations.CreateModel(
            name='Subscription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('subscriber',
                 models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subscriptions',
                                   to=settings.AUTH_USER_MODEL)),
                ('target', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='subscribers',
                                             to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('subscriber', 'target')},
            },
        ),
    ]
