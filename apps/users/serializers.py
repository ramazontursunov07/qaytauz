from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Notification, Report, Review, BlockedUser, Subscription

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'phone_number', 'region']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone_number', 'region', 'avatar', 'avatar_preset', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'notification_type', 'text', 'is_read', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class PublicUserSerializer(serializers.ModelSerializer):
    joined_date = serializers.DateTimeField(source='date_joined', format='%d.%m.%y', read_only=True)
    listings_count = serializers.SerializerMethodField()
    subscribers_count = serializers.SerializerMethodField()
    is_subscribed = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'joined_date', 'listings_count', 'subscribers_count', 'is_subscribed',
                  'avatar', 'avatar_preset', 'phone_number', 'rating', 'reviews_count']

    def get_listings_count(self, obj):
        return obj.products.filter(status='Faol').count()

    def get_subscribers_count(self, obj):
        return obj.subscribers.count()

    def get_rating(self, obj):
        reviews = obj.reviews_received.all()
        if not reviews:
            return 0
        return round(sum(r.rating for r in reviews) / len(reviews), 1)

    def get_reviews_count(self, obj):
        return obj.reviews_received.count()

    def get_is_subscribed(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return Subscription.objects.filter(subscriber=request.user, target=obj).exists()


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone_number', 'region', 'is_active', 'is_staff', 'date_joined']
        read_only_fields = ['id', 'username', 'email', 'date_joined']


class BlockUserSerializer(serializers.ModelSerializer):
    """Chat sahifasidagi "Foydalanuvchini bloklash" tugmasi uchun."""

    class Meta:
        model = BlockedUser
        fields = ['id', 'blocked', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_blocked(self, value):
        if value == self.context['request'].user:
            raise serializers.ValidationError("O'zingizni bloklay olmaysiz.")
        return value

    def create(self, validated_data):
        blocker = self.context['request'].user
        obj, _ = BlockedUser.objects.get_or_create(blocker=blocker, blocked=validated_data['blocked'])
        return obj


class ReportCreateSerializer(serializers.ModelSerializer):
    """Foydalanuvchi bir e'lon haqida shikoyat yuborishi uchun (Shikoyat qilish tugmasi)."""

    class Meta:
        model = Report
        fields = ['id', 'product', 'reason']
        read_only_fields = ['id']

    def create(self, validated_data):
        validated_data['reporter'] = self.context['request'].user
        return super().create(validated_data)


class AdminReportSerializer(serializers.ModelSerializer):
    reporter_username = serializers.CharField(source='reporter.username', read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'product', 'product_title', 'reporter', 'reporter_username', 'reason', 'is_resolved',
                  'created_at']
        read_only_fields = ['id', 'product', 'reporter', 'reason', 'created_at']


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'seller', 'product', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Baho 1 dan 5 gacha bo'lishi kerak.")
        return value


class SellerReviewSerializer(serializers.ModelSerializer):
    reviewer_username = serializers.CharField(source='reviewer.username', read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'reviewer_username', 'product', 'product_title', 'rating', 'comment', 'created_at']


class AdminReviewSerializer(serializers.ModelSerializer):
    reviewer_username = serializers.CharField(source='reviewer.username', read_only=True)
    seller_username = serializers.CharField(source='seller.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'reviewer_username', 'seller_username', 'rating', 'comment', 'created_at']
