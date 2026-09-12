from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.conf import settings

phone_number = RegexValidator(
    regex=r'^\+998\d{9}$',
    message='Telefon raqamni to\'g\'ri formatda kiriting:+998xxxxxxxxx '
)


class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone_number = models.CharField(validators=[phone_number], max_length=13, null=True, blank=True)
    region = models.CharField(max_length=100, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    avatar_preset = models.CharField(max_length=10, blank=True, null=True)

    def __str__(self):
        return self.username


class Review(models.Model):  # Sharh
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews_given')
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews_received')
    # Sharh aynan qaysi e'lon (bitim) bo'yicha qoldirilganini bildiradi.
    product = models.ForeignKey(
        'products.Product', on_delete=models.SET_NULL, null=True, blank=True, related_name='reviews'
    )
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['reviewer', 'product'],
                condition=models.Q(product__isnull=False),
                name='unique_review_per_reviewer_product',
            )
        ]

    def __str__(self):
        return f"{self.reviewer.username} -> {self.seller.username}: {self.rating}"


class Report(models.Model):  # Hisobot(Shikoyat)
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE, related_name='reports')
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports')
    reason = models.TextField()
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report: {self.product.title} by {self.reporter.username}"


class Notification(models.Model):
    MESSAGE = 'Yangi xabar'
    FAVORITE = 'E\'lon yoqtirildi'
    REVIEW = 'Yangi sharh'
    MODERATION = 'Moderatsiya natijasi'
    PROMO = 'Aksiya/chegirma'

    NOTIFICATION_TYPES = [
        (MESSAGE, 'Yangi xabar'),
        (FAVORITE, 'E\'lon yoqtirildi'),
        (REVIEW, 'Yangi sharh'),
        (MODERATION, 'Moderatsiya natijasi'),
        (PROMO, 'Aksiya/chegirma')
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    text = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username if self.user else 'Umumiy'}: {self.text}"


class BlockedUser(models.Model):
    """Foydalanuvchi boshqa foydalanuvchini bloklaganda yaratiladi (chat sahifasidagi
    "Foydalanuvchini bloklash" tugmasi)."""
    blocker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blocking')
    blocked = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blocked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('blocker', 'blocked')

    def __str__(self):
        return f"{self.blocker} blocked {self.blocked}"


class Subscription(models.Model):
    """Foydalanuvchi boshqa foydalanuvchining profiliga obuna bo'lganda yaratiladi
    (profil sahifasidagi "Obuna bo'lish" tugmasi)."""
    subscriber = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscriptions')
    target = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscribers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('subscriber', 'target')

    def __str__(self):
        return f"{self.subscriber} subscribed to {self.target}"
    