from rest_framework import status
from django.contrib.auth import get_user_model
from apps.chats.models import Chat, Message
from django.urls import reverse
from rest_framework.test import APITestCase

from apps.products.models import Category, Product

User = get_user_model()


class ChatAPITest(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            username='testuser1',
            password='testpass123',
            email='user1@example.com',
            phone_number='+998901234567',
            region='Toshkent'
        )
        self.user2 = User.objects.create_user(
            username='testuser2',
            password='testpass1234',
            email='user2@example.com',
            phone_number='+998931234567',
            region='Samarqand'
        )
        self.user3 = User.objects.create_user(
            username='testuser3',
            password='testpass123',
            email='user3@example.com',
            phone_number='+998941234567',
            region='Buxoro'
        )
        self.category = Category.objects.create(
            name='Elektronika',
            slug='elektronika')
        self.product = Product.objects.create(
            title='iPhone 13',
            description='Yaxshi holatda',
            price=3000000,
            condition=Product.USED,
            category=self.category,
            owner=self.user1,
            region='Toshkent',
            status=Product.ACTIVE
        )
        self.chat = Chat.objects.create(product=self.product)
        self.chat.participants.set([self.user1, self.user2])

    def test_chat_create_requires_login(self):
        url = reverse('chat-create')
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_chat_create_success(self):
        url = reverse('chat-create')
        self.client.force_authenticate(self.user1)
        data = {
            'product': self.product.id,
            'participants': [self.user1.id, self.user2.id]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Chat.objects.count(), 2)

    def test_chat_list_shows_only_participated(self):
        url = reverse('chat-list')
        self.client.force_authenticate(self.user1)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['id'], self.chat.id)

        self.client.force_authenticate(self.user3)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)

    def test_chat_detail_only_participant(self):
        url = reverse('chat-detail', kwargs={'pk': self.chat.id})
        self.client.force_authenticate(self.user1)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.chat.id)

        self.client.force_authenticate(self.user3)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_message_create_requires_login(self):
        url = reverse('message-create')
        data = {
            'chat': self.chat.id,
            'text': 'Salom!'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_message_create_success(self):
        url = reverse('message-create')
        self.client.force_authenticate(self.user1)
        data = {
            'chat': self.chat.id,
            'text': 'Salom!'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Message.objects.count(), 1)
        self.assertEqual(Message.objects.first().sender, self.user1)

    def test_message_create_by_non_participant_fails(self):
        url = reverse('message-create')
        self.client.force_authenticate(self.user3)
        data = {
            'chat': self.chat.id,
            'text': 'Men ishtirokchi emasman'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
