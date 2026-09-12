from rest_framework import serializers
from ..users.models import Notification
from ..products.serializers import ProductListSerializer
from .models import Favorite, FollowedSeller


class FavoriteSerializer(serializers.ModelSerializer):
    product_detail = ProductListSerializer(source='product', read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'product', 'product_detail', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

    def validate(self, data):
        user = self.context['request'].user
        product = data['product']
        if Favorite.objects.filter(user=user, product=product).exists():
            raise serializers.ValidationError("Bu mahsulot allaqacon sevimlilarga qo'shilgan!")
        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        favorite = super().create(validated_data)

        product_owner = favorite.product.owner
        if product_owner != favorite.user:
            Notification.objects.create(
                user=product_owner,
                notification_type='favorite',
                text=f"{favorite.user.username} '{favorite.product.title}' e'loningizni sevimlilarga qo'shdi.",
            )
        return favorite


class FollowedSellerSerializer(serializers.ModelSerializer):
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    seller_region = serializers.CharField(source='seller.region', read_only=True)

    class Meta:
        model = FollowedSeller
        fields = ['id', 'seller', 'seller_username', 'seller_region', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

    def validate(self, data):
        user = self.context['request'].user
        seller = data['seller']
        if seller == user:
            raise serializers.ValidationError("O'zingizni kuzatib bo'lmaydi!")
        if FollowedSeller.objects.filter(user=user, seller=seller).exists():
            raise serializers.ValidationError("Bu sotuvchi allaqachon kuzatilmoqda!")
        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
