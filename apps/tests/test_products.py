from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse
from apps.products.models import Category, Product

User = get_user_model()


class ProductAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='owner1',
            password='testpass123',
            email='owner1@example.com',
            phone_number='+998901234567',
            region='Toshkent')
        self.other_user = User.objects.create_user(
            username='otheruser',
            password='testpass123',
            email='otheruser@example.com',
            phone_number='+998902345678',
            region='Samarqand')
        self.admin_user = User.objects.create_superuser(
            username='admin1',
            password='adminpass123',
            email='admin1@example.com',
            phone_number='+998901234569',
            region='Toshkent')
        self.category = Category.objects.create(
            name='Elektronika',
            slug='elektronika')
        self.product = Product.objects.create(
            title='iPhone 13',
            description='Yaxshi holatda',
            price=3000000,
            condition=Product.USED,
            category=self.category,
            owner=self.user,
            region='Toshkent',
            status=Product.ACTIVE
        )

    def test_category_list(self):
        url = reverse('category-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_product_list_public(self):
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_category_create_requires_admin(self):
        url = reverse('category-create')
        data = {'name': 'Kiyimlar', 'slug': 'kiyimlar'}

        # login qilmasdan
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # oddiy user bilan
        self.client.force_authenticate(user=self.user)
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # admin bilan
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_product_create_requires_login(self):
        url = reverse('product-create')
        data = {
            'title': 'Samsung Galaxy',
            'description': 'Yangi telefon',
            'price': 4000000,
            'condition': Product.NEW,
            'category': self.category.id,
            'region': 'Toshkent',
            'attribute_values': []
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_product_create_success(self):
        url = reverse('product-create')
        self.client.force_authenticate(user=self.user)
        data = {
            'title': 'Samsung Galaxy',
            'description': 'Yangi telefon',
            'price': 4000000,
            'condition': Product.NEW,
            'category': self.category.id,
            'region': 'Toshkent',
            'attribute_values': []
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 2)
        self.assertEqual(Product.objects.last().owner, self.user)

    def test_product_detail_view(self):
        url = reverse('product-detail', kwargs={'pk': self.product.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.views_count, 1)

    def test_product_update_only_owner(self):
        # egasi
        url = reverse('product-manage', kwargs={'pk': self.product.id})
        self.client.force_authenticate(self.user)
        data = {
            'title': 'Yangi mahsulot'
        }
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # boshqa user
        self.client.force_authenticate(self.other_user)
        data = {
            'title': 'Yangi mahsulot2'
        }
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_product_delete_only_owner(self):
        # boshqa user
        url = reverse('product-manage', kwargs={'pk': self.product.id})
        self.client.force_authenticate(self.other_user)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # egasi
        self.client.force_authenticate(self.user)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Product.objects.count(), 0)

    def test_my_products_list(self):
        # mahsulot egasi bo'lgan user
        url = reverse('my-products')
        self.client.force_authenticate(self.user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

        # # boshqa (mahsulot egasi bo'lmagan) user
        self.client.force_authenticate(self.other_user)
        response = self.client.get(url)
        self.assertEqual(len(response.data['results']), 0)


class ProductModerationTest(APITestCase):
    """Moderatsiyani chetlab o'tish (CRITICAL) kamchiligi uchun regression testlar."""

    def setUp(self):
        self.owner = User.objects.create_user(
            username='owner2', password='testpass123', email='owner2@example.com',
            phone_number='+998901111111', region='Toshkent')
        self.other_user = User.objects.create_user(
            username='other2', password='testpass123', email='other2@example.com',
            phone_number='+998902222222', region='Samarqand')
        self.admin_user = User.objects.create_superuser(
            username='admin2', password='adminpass123', email='admin2@example.com',
            phone_number='+998903333333', region='Toshkent')
        self.category = Category.objects.create(name='Kiyimlar', slug='kiyimlar')
        self.active = Product.objects.create(
            title='Faol e\'lon', description='x', price=1000, category=self.category,
            owner=self.owner, status=Product.ACTIVE)
        self.blocked = Product.objects.create(
            title='Bloklangan e\'lon', description='x', price=1000, category=self.category,
            owner=self.owner, status=Product.BLOCKED)
        self.manage_blocked = reverse('product-manage', kwargs={'pk': self.blocked.id})
        self.detail_blocked = reverse('product-detail', kwargs={'pk': self.blocked.id})

    # --- egasi holatni PATCH orqali o'zgartira olmaydi ---
    def test_owner_cannot_unblock_via_patch(self):
        self.client.force_authenticate(self.owner)
        self.client.patch(self.manage_blocked, {'status': Product.ACTIVE}, format='json')
        self.blocked.refresh_from_db()
        self.assertEqual(self.blocked.status, Product.BLOCKED)

    def test_owner_cannot_change_active_status_via_patch(self):
        self.client.force_authenticate(self.owner)
        url = reverse('product-manage', kwargs={'pk': self.active.id})
        self.client.patch(url, {'status': Product.PENDING}, format='json')
        self.active.refresh_from_db()
        self.assertEqual(self.active.status, Product.ACTIVE)

    # --- mark-sold ---
    def test_owner_can_mark_active_as_sold(self):
        self.client.force_authenticate(self.owner)
        url = reverse('product-mark-sold', kwargs={'pk': self.active.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.active.refresh_from_db()
        self.assertEqual(self.active.status, Product.SOLD)

    def test_owner_cannot_mark_blocked_as_sold(self):
        self.client.force_authenticate(self.owner)
        url = reverse('product-mark-sold', kwargs={'pk': self.blocked.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.blocked.refresh_from_db()
        self.assertEqual(self.blocked.status, Product.BLOCKED)

    def test_other_user_cannot_mark_sold(self):
        self.client.force_authenticate(self.other_user)
        url = reverse('product-mark-sold', kwargs={'pk': self.active.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_mark_sold_requires_login(self):
        url = reverse('product-mark-sold', kwargs={'pk': self.active.id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # --- ommaviy ko'rinish ---
    def test_blocked_hidden_from_public_list(self):
        url = reverse('product-list')
        for query in ('', '?status=Bloklangan', '?status=Arxiv'):
            response = self.client.get(url + query)
            ids = [p['id'] for p in response.data['results']]
            self.assertNotIn(self.blocked.id, ids, query)

    def test_blocked_detail_hidden_from_anonymous_and_others(self):
        self.assertEqual(self.client.get(self.detail_blocked).status_code, status.HTTP_404_NOT_FOUND)
        self.client.force_authenticate(self.other_user)
        self.assertEqual(self.client.get(self.detail_blocked).status_code, status.HTTP_404_NOT_FOUND)

    def test_owner_and_admin_can_see_blocked_detail(self):
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.get(self.detail_blocked).status_code, status.HTTP_200_OK)
        self.client.force_authenticate(self.admin_user)
        self.assertEqual(self.client.get(self.detail_blocked).status_code, status.HTTP_200_OK)

    # --- admin ---
    def test_admin_can_unblock(self):
        self.client.force_authenticate(self.admin_user)
        url = reverse('admin-product-manage', kwargs={'pk': self.blocked.id})
        response = self.client.patch(url, {'status': Product.ACTIVE}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.blocked.refresh_from_db()
        self.assertEqual(self.blocked.status, Product.ACTIVE)
