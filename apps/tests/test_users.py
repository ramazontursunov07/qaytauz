from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse
from apps.chats.models import Chat
from apps.products.models import Category, Product
from apps.users.models import Review

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


class ReviewCreateTest(APITestCase):
    """Sharh yaratish: seller clientdan olinmaydi, o'ziga/begona e'longa/takror sharh mumkin emas."""

    def setUp(self):
        self.seller = User.objects.create_user(
            username='seller3', password='testpass123', email='seller3@example.com',
            phone_number='+998901010101', region='Toshkent')
        self.buyer = User.objects.create_user(
            username='buyer3', password='testpass123', email='buyer3@example.com',
            phone_number='+998902020202', region='Samarqand')
        self.stranger = User.objects.create_user(
            username='stranger3', password='testpass123', email='stranger3@example.com',
            phone_number='+998903030303', region='Buxoro')
        self.category = Category.objects.create(name='Uy jihozlari', slug='uy-jihozlari')
        self.product = Product.objects.create(
            title='Divan', description='x', price=1000, category=self.category,
            owner=self.seller, status=Product.ACTIVE)
        self.blocked_product = Product.objects.create(
            title='Bloklangan', description='x', price=1000, category=self.category,
            owner=self.seller, status=Product.BLOCKED)
        # Xaridor va sotuvchi ikkala e'lon bo'yicha ham chatlashgan
        for p in (self.product, self.blocked_product):
            chat = Chat.objects.create(product=p)
            chat.participants.add(self.buyer, self.seller)
        self.url = reverse('review-create')

    def _payload(self, **kw):
        data = {'seller': self.seller.id, 'product': self.product.id, 'rating': 5, 'comment': 'Yaxshi'}
        data.update(kw)
        return data

    def test_review_requires_login(self):
        response = self.client.post(self.url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_review_success_seller_taken_from_product(self):
        self.client.force_authenticate(self.buyer)
        response = self.client.post(self.url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        review = Review.objects.get()
        self.assertEqual(review.reviewer, self.buyer)
        self.assertEqual(review.seller, self.seller)

    def test_client_cannot_choose_other_seller(self):
        """Client boshqa 'seller' ID yuborsa ham, sharh e'lon egasiga yoziladi."""
        self.client.force_authenticate(self.buyer)
        response = self.client.post(
            self.url, self._payload(seller=self.stranger.id), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        review = Review.objects.get()
        self.assertEqual(review.seller, self.seller)
        self.assertNotEqual(review.seller, self.stranger)

    def test_cannot_review_own_product(self):
        self.client.force_authenticate(self.seller)
        response = self.client.post(self.url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Review.objects.count(), 0)

    def test_cannot_review_without_deal_chat(self):
        self.client.force_authenticate(self.stranger)
        response = self.client.post(self.url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Review.objects.count(), 0)

    def test_cannot_review_blocked_product(self):
        self.client.force_authenticate(self.buyer)
        response = self.client.post(
            self.url, self._payload(product=self.blocked_product.id), format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Review.objects.count(), 0)

    def test_can_review_sold_product(self):
        self.product.status = Product.SOLD
        self.product.save()
        self.client.force_authenticate(self.buyer)
        response = self.client.post(self.url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_duplicate_review_fails(self):
        self.client.force_authenticate(self.buyer)
        first = self.client.post(self.url, self._payload(), format='json')
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        second = self.client.post(self.url, self._payload(rating=1), format='json')
        self.assertEqual(second.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Review.objects.count(), 1)

    def test_product_is_required(self):
        self.client.force_authenticate(self.buyer)
        data = self._payload()
        del data['product']
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_rating_must_be_between_1_and_5(self):
        self.client.force_authenticate(self.buyer)
        for bad in (0, 6):
            response = self.client.post(self.url, self._payload(rating=bad), format='json')
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, bad)
        self.assertEqual(Review.objects.count(), 0)
