from django.db import models
from django.conf import settings
from django.utils import timezone


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='subcategories')

    def __str__(self):
        return self.name


class Product(models.Model):
    NEW = 'Yangi'
    USED = 'Ishlatilgan'

    CONDITION_CHOICES = [
        (NEW, 'yangi'),
        (USED, 'ishlatilgan')
    ]

    ACTIVE = 'Faol'
    SOLD = 'Sotildi'
    PENDING = 'Ko‘rib chiqilmoqda'
    BLOCKED = 'Bloklangan'

    STATUS_CHOICES = [
        (ACTIVE, 'faol'),
        (SOLD, 'sotildi'),
        (PENDING, 'ko\'rib chiqilmoqda'),
        (BLOCKED, 'bloklangan')
    ]

    title = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=14, decimal_places=2)
    condition = models.CharField(max_length=11, choices=CONDITION_CHOICES, default=USED)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='products')
    region = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=ACTIVE)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    extra_info = models.JSONField(default=dict, blank=True)
    free_delivery = models.BooleanField(default=False)

    def __str__(self):
        return self.title


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/%Y/%m/')
    is_main = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.title} - image"


class AttributeType(models.Model):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='attribute_types')

    def __str__(self):
        return self.name


class ProductAttributeValue(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='attribute_values')
    attribute_type = models.ForeignKey(AttributeType, on_delete=models.CASCADE)
    value = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.attribute_type.name}: {self.value}"


class ProductViewHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='view_history')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='view_history')
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-viewed_at']

    def __str__(self):
        return f"{self.user.username} - {self.product.title}"


class FlashSale(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='flash_sales')
    discount_percentage = models.PositiveSmallIntegerField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

    @property
    def is_active(self):
        now = timezone.now()
        return self.start_time <= now <= self.end_time

    def __str__(self):
        return f"{self.product.title} - {self.discount_percentage}% off"
