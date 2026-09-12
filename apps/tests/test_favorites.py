from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from apps.favorites.models import Favorite
from apps.products.models import Category, Product
from django.contrib.auth import get_user_model

from apps.users.models import phone_number

User = get_user_model()


class FavoriteAPITest(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            username='owner1',
            password='testpass123',
            email='owner1@example.com',
            phone_number='+998901234567',
            region='Toshkent')
        self.user = User.objects.create_user(
            username='favuser1',
            password='testpass123',
            email='favuser1@example.com',
            phone_number='+998934678912',
            region='Samarqand')
        self.category = Category.objects.create(
            name='Elektronika',
            slug='elektronika')
        self.product = Product.objects.create(
            title='iPhone 13',
            description='Yaxshi holatda',
            price=3000000,
            condition=Product.USED,
            category=self.category,
            owner=self.owner,
            region='Toshkent',
            status=Product.ACTIVE
        )

    def test_favorite_create_requires_login(self):
        url = reverse('favorite-list-create')
        data = {
            'product': self.product.id
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_favorite_create_success(self):
        url = reverse('favorite-list-create')
        self.client.force_authenticate(self.user)
        data = {
            'product': self.product.id
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Favorite.objects.count(), 1)

    def test_favorite_duplicate_fails(self):
        url = reverse('favorite-list-create')
        self.client.force_authenticate(self.user)
        data = {
            'product': self.product.id
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_favorite_list_shows_only_own(self):
        self.favorite = Favorite.objects.create(user=self.user, product=self.product)
        url = reverse('favorite-list-create')
        self.client.force_authenticate(self.user)
        response = self.client.get(url)
        self.assertEqual(len(response.data['results']), 1)

        self.client.force_authenticate(self.owner)
        response = self.client.get(url)
        self.assertEqual(len(response.data['results']), 0)

    def test_favorite_delete_only_own(self):
        favorite = Favorite.objects.create(user=self.user, product=self.product)
        url = reverse('favorite-delete', kwargs={'pk': favorite.id})

        self.client.force_authenticate(self.owner)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.client.force_authenticate(self.user)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
