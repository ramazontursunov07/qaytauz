from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse
from apps.chats.models import Chat
from apps.products.models import Category, Product
from apps.users.models import Review
from apps.users.models import Notification

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
        """foydalanuvchi login qilmasdan sharh yoza olmasligi"""
        response = self.client.post(self.url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_review_success_seller_taken_from_product(self):
        """Muvaffaqiyatli sharh qoldirilganini tekshiradi."""
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
        """Sotuvchi o'zining mahsulotiga sharh yoza olmaydi."""
        self.client.force_authenticate(self.seller)
        response = self.client.post(self.url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Review.objects.count(), 0)

    def test_cannot_review_without_deal_chat(self):
        """Chat qurmagan foydalanuvchi sharh qoldira olmaydi."""
        self.client.force_authenticate(self.stranger)
        response = self.client.post(self.url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Review.objects.count(), 0)

    def test_cannot_review_blocked_product(self):
        """Bloklangan mahsulotga sharh yoza olmasligi."""
        self.client.force_authenticate(self.buyer)
        response = self.client.post(
            self.url, self._payload(product=self.blocked_product.id), format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Review.objects.count(), 0)

    def test_can_review_sold_product(self):
        """Statusi sotilgan deb belgilangan e'longa ham sharh yozsa bo'ladi."""
        self.product.status = Product.SOLD
        self.product.save()
        self.client.force_authenticate(self.buyer)
        response = self.client.post(self.url, self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_duplicate_review_fails(self):
        """Bir foydalanuvchi ikki marta bir xil e'longa sharh yoza olmaydi."""
        self.client.force_authenticate(self.buyer)
        first = self.client.post(self.url, self._payload(), format='json')
        self.assertEqual(first.status_code, status.HTTP_201_CREATED)
        second = self.client.post(self.url, self._payload(rating=1), format='json')
        self.assertEqual(second.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Review.objects.count(), 1)

    def test_product_is_required(self):
        """E'lon o'chgandan so'ng unga sharh yozib bo'lmaydi."""
        self.client.force_authenticate(self.buyer)
        data = self._payload()
        del data['product']
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_rating_must_be_between_1_and_5(self):
        """Rating 1dan 5gacha bo'lishi kerak."""
        self.client.force_authenticate(self.buyer)
        for bad in (0, 6):
            response = self.client.post(self.url, self._payload(rating=bad), format='json')
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, bad)
        self.assertEqual(Review.objects.count(), 0)


class RegisterPasswordValidationTest(APITestCase):
    """AUTH_PASSWORD_VALIDATORS registratsiyada ishlashini tekshiradi (MEDIUM #4)."""

    def _payload(self, **kw):
        data = {
            'username': 'newuser1',
            'email': 'newuser1@example.com',
            'password': 'StrongPass9!',
            'phone_number': '+998901234599',
            'region': 'Toshkent',
        }
        data.update(kw)
        return data

    def test_common_password_rejected(self):
        """CommonPasswordValidator: juda ko'p ishlatiladigan parol rad etilishi kerak."""
        url = reverse('register')
        response = self.client.post(url, self._payload(password='password'))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.filter(username='newuser1').count(), 0)

    def test_numeric_only_password_rejected(self):
        """NumericPasswordValidator: faqat raqamlardan iborat parol rad etilishi kerak."""
        url = reverse('register')
        response = self.client.post(url, self._payload(password='12345678'))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_too_short_password_rejected(self):
        """MinimumLengthValidator: juda qisqa parol rad etilishi kerak."""
        url = reverse('register')
        response = self.client.post(url, self._payload(password='abc123'))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_similar_to_username_rejected(self):
        """UserAttributeSimilarityValidator: parol username'ga juda o'xshasa rad etilishi kerak."""
        url = reverse('register')
        response = self.client.post(url, self._payload(
            username='johnsmith2024', password='johnsmith2024'))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_strong_password_accepted(self):
        """Kuchli, boshqa validatorlarga mos parol muvaffaqiyatli ro'yxatdan o'tishi kerak."""
        url = reverse('register')
        response = self.client.post(url, self._payload())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser1').exists())


class NotificationModelTest(APITestCase):
    """Notification.notification_type doim model choices'dagi (machine-value)
    qiymatlardan biriga teng bo'lishini tekshiradi - eski xatoda kod
    ('favorite', 'message') va model choices ('E'lon yoqtirildi', 'Yangi xabar')
    bir-biriga mos kelmas edi."""

    def test_choice_values_are_stable_machine_values(self):
        valid_values = dict(Notification.NotificationType.choices).keys()
        # Choices qiymatlari inson o'qiydigan matn emas, dasturiy kod bo'lishi kerak
        self.assertIn('message', valid_values)
        self.assertIn('favorite', valid_values)
        self.assertIn('review', valid_values)
        self.assertIn('moderation', valid_values)
        self.assertIn('promo', valid_values)

    def test_choice_values_fit_max_length(self):
        # notification_type = CharField(max_length=20) - har bir qiymat shu chegaraga sig'ishi kerak
        for value, _label in Notification.NotificationType.choices:
            self.assertLessEqual(len(value), 20)

    def test_notification_type_constants_match_choices(self):
        # Notification.MESSAGE kabi eski usulda ishlatilsa ham, choices bilan mos kelishi kerak
        self.assertEqual(Notification.MESSAGE, Notification.NotificationType.MESSAGE)
        self.assertEqual(Notification.FAVORITE, Notification.NotificationType.FAVORITE)