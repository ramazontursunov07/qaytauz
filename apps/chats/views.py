from django.db.models import Prefetch
from rest_framework import views, generics, permissions
from .models import Chat, Message
from .serializers import ChatSerializer, ChatCreateSerializer, ChatDetailSerializer, MessageSerializer


class ChatListView(generics.ListAPIView):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Chat.objects.filter(participants=self.request.user).select_related('product').\
            prefetch_related('participants',Prefetch('messages',queryset=Message.objects.select_related('sender').\
            order_by('-created_at')))


class ChatCreateView(generics.CreateAPIView):
    serializer_class = ChatCreateSerializer
    permission_classes = [permissions.IsAuthenticated]


class ChatDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ChatDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Chat.objects.filter(participants=self.request.user)


class MessageCreateView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
