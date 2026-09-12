from rest_framework import test, status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

User = get_user_model()


class UserAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='testuser@example.com',
            phone_number='+998901234567',
            region='Toshkent')

    def test_register_success(self):
        url = reverse('register')
        data = {
            'username': 'testuser4',
            'email': 'testuser4@example.com',
            'password': 'testpass1234',
            'phone_number': '+998901234567',
            'region': 'Toshkent'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 2)

    def test_register_password_not_returned(self):
        url = reverse('register')
        data = {
            'username': 'testuser3',
            'email': 'testuser3@example.com',
            'password': 'testpass123',
            'phone_number': '+998901234567',
            'region': 'Toshkent'
        }
        response = self.client.post(url, data)
        self.assertNotIn('password', response.data)

    def test_register_duplicate_email_fails(self):
        url = reverse('register')
        data = {
            'username': 'testuser5',
            'email': 'testuser@example.com',
            'password': 'testpass123',
            'phone_number': '+998901234567',
            'region': 'Toshkent'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_login_success(self):
        url = reverse('token_obtain_pair')
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_wrong_password_fails(self):
        url = reverse('token_obtain_pair')
        data = {
            'username': 'loginuser',
            'password': 'wrongpassword'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_requires_login(self):
        url = reverse('profile')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_view_with_login(self):
        login_url = reverse('token_obtain_pair')
        login_response = self.client.post(login_url, {
            'username': 'testuser',
            'password': 'testpass123'
        })
        access_token = login_response.data['access']
        profile_url = reverse('profile')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')

    def test_profile_update(self):
        login_url = reverse('token_obtain_pair')
        login_response = self.client.post(login_url, {
            'username': 'testuser',
            'password': 'testpass123'
        })
        access_token = login_response.data['access']
        profile_url = reverse('profile')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        data = {
            'region': 'Samarqand'
        }
        response = self.client.patch(profile_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['region'], 'Samarqand')

        self.user.refresh_from_db()
        self.assertEqual(self.user.region, 'Samarqand')
