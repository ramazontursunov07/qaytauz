from django.urls import path
from .views import  ChatListView, MessageCreateView, ChatCreateView, ChatDetailView

urlpatterns = [
    path('chat-list/', ChatListView.as_view(), name='chat-list'),
    path('chat-create/', ChatCreateView.as_view(), name='chat-create'),
    path('chat-detail/<int:pk>/', ChatDetailView.as_view(), name='chat-detail'),
    path('message-create/', MessageCreateView.as_view(), name='message-create')
]
