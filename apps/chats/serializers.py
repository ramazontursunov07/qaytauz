from rest_framework import serializers
from .models import Chat, Message
from ..users.models import Notification, BlockedUser


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'chat', 'sender', 'sender_username', 'text', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'is_read', 'created_at']

    def validate(self, data):
        user = self.context['request'].user
        chat = data['chat']
        if user not in chat.participants.all():
            raise serializers.ValidationError("Siz bu chatning ishtirokchisi emassiz!")
        # Bloklangan foydalanuvchilar bir-biriga xabar yoza olmaydi
        # (istalgan tomon bloklagan bo'lsa ham).
        others = chat.participants.exclude(id=user.id)
        if BlockedUser.objects.filter(blocker=user, blocked__in=others).exists() or \
                BlockedUser.objects.filter(blocker__in=others, blocked=user).exists():
            raise serializers.ValidationError("Bu foydalanuvchiga xabar yubora olmaysiz.")
        return data

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        message = super().create(validated_data)

        chat = message.chat
        for participant in chat.participants.all():
            if participant != message.sender:
                Notification.objects.create(
                    user=participant,
                    notification_type='message',
                    text=f'{message.sender.username} sizga yabgi xabar yubordi.'
                )
        return message

class ChatSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    product_title = serializers.CharField(source='product.title', read_only=True)

    class Meta:
        model = Chat
        fields = ['id', 'participants', 'product', 'product_title', 'last_message', 'created_at']

    def get_last_message(self, obj):
        last = obj.messages.last()
        if last:
            return {
                'text': last.text,
                'sender': last.sender.username,
                'created_at': last.created_at
            }
        return None


class ChatDetailSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True)

    class Meta:
        model = Chat
        fields = ['id', 'participants', 'product', 'product_title', 'messages', 'created_at']


class ChatCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chat
        fields = ['id', 'product']


    def validate_product(self,product):
        request = self.context['request']
        if product.owner_id == request.user.id:
            raise serializers.ValidationError("O'zingizning e'loningizga chat ocha olmaysiz.")
        return product

    def create(self,validated_data):
        request = self.context['request']
        product = validated_data.get('product')
        buyer = request.user
        seller = product.owner

        existing = Chat.objects.filter(product=product).filter(participants=buyer).filter(participants=seller).first()

        if existing:
            return existing

        chat = Chat.objects.create(product=product)
        chat.participants.set([buyer,seller])
        return chat
