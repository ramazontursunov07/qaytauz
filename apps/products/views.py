from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status as http_status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Category, Product, AttributeType, ProductImage
from .filters import ProductFilter
from .serializers import (CategorySerializer,
                          ProductListSerializer,
                          ProductDetailSerializer,
                          ProductCreateSerializer, AttributeTypeSerializer,
                          ProductUpdateSerializer)
from django.db.models import Prefetch


class CategoryListView(generics.ListAPIView):
    """Barcha categoriyalar"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class CategoryCreateView(generics.CreateAPIView):
    """Faqat admin yaratadi"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAdminUser]


class CategoryUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """Faqat admin o'zgartiradi va o'chiradi"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAdminUser]


class ProductListView(generics.ListAPIView):
    """Barcha e'lonlar ro'yxati filter va qidiruv bilan birgalikda!"""
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['title', 'description']
    # ProductFilters.jsx (Filtrlar sahifasi)dagi "Saralash" tanlovi shu orqali ishlaydi:
    # ?ordering=price / -price / -created_at
    ordering_fields = ['price', 'created_at']

    def get_queryset(self):
        qs = (
            Product.objects
            .select_related('category', 'owner')
            .prefetch_related(
                Prefetch(
                    'images',
                    queryset=ProductImage.objects.order_by('-is_main', 'id'),
                    to_attr='prefetched_images',
                )
            )
            .order_by('-created_at')
        )
        if self.request.query_params.get('status'):
            return qs.filter(status__in=[Product.ACTIVE, Product.SOLD])
        return qs.filter(status=Product.ACTIVE)


class ProductDetailView(generics.RetrieveAPIView):
    """Bitta e'lonni to'liq ko'rish"""
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        public = Q(status__in=[Product.ACTIVE, Product.SOLD])
        if user.is_authenticated:
            if user.is_staff:
                return Product.objects.all()
            # Egasi o'zining har qanday holatdagi e'lonini ko'ra oladi
            return Product.objects.filter(public | Q(owner=user))
        return Product.objects.filter(public)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user if request.user.is_authenticated else None
        # E'lon egasi o'z e'lonini ochganda ko'rishlar soni oshmasligi kerak —
        # faqat boshqa (yoki anonim) foydalanuvchilar ko'rganda hisoblanadi.
        if user is None or user.id != instance.owner_id:
            instance.views_count += 1
            instance.save(update_fields=['views_count'])
        return super().retrieve(request, *args, **kwargs)


class ProductCreateView(generics.CreateAPIView):
    """Yangi e'lon joylash"""
    queryset = Product.objects.all()
    serializer_class = ProductCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def perform_create(self, serializer):
        product = serializer.save()
        images = self.request.FILES.getlist('images')
        for i, image_file in enumerate(images):
            ProductImage.objects.create(product=product, image=image_file, is_main=(i == 0))


class MyProductListView(generics.ListAPIView):
    """O'z e'lonlarim"""
    serializer_class = ProductListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(owner=self.request.user)


class ProductUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """E'lonlarni tahrirlash va o'chirish faqat egasi"""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Product.objects.filter(owner=self.request.user)

    def get_serializer_class(self):
        if self.request.method in ('PATCH', 'PUT'):
            return ProductUpdateSerializer
        return ProductDetailSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        had_images = instance.images.exists()
        product = serializer.save()

        # Yangi qo'shilgan rasmlar bo'lsa (multipart/form-data orqali)
        new_images = request.FILES.getlist('images')
        for i, image_file in enumerate(new_images):
            ProductImage.objects.create(
                product=product,
                image=image_file,
                is_main=(not had_images and i == 0),
            )

        # Javobni to'liq (o'qish uchun mo'ljallangan) serializer bilan qaytaramiz,
        # shunda frontend yangilangan rasmlar/atributlar ro'yxatini ham darhol oladi.
        output_serializer = ProductDetailSerializer(product, context=self.get_serializer_context())
        return Response(output_serializer.data)


class ProductMarkSoldView(APIView):
    """Egasi e'lonni faqat 'Sotildi' qila oladi (faqat Faol e'londan).

    Bloklangan / Ko'rib chiqilmoqda e'lonlarning holatini egasi o'zgartira olmaydi —
    ularni faqat admin (AdminProductUpdateDeleteView) boshqaradi.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        product = get_object_or_404(Product, pk=pk, owner=request.user)
        if product.status != Product.ACTIVE:
            return Response({'detail': "Faqat faol e'lonni sotilgan deb belgilash mumkin."},
                            status=http_status.HTTP_400_BAD_REQUEST)
        product.status = Product.SOLD
        product.save(update_fields=['status', 'updated_at'])
        return Response(ProductDetailSerializer(product, context={'request': request}).data)


class AttributeTypeListView(generics.ListAPIView):
    serializer_class = AttributeTypeSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        category_id = self.request.query_params.get('category')
        if category_id:
            return AttributeType.objects.filter(category_id=category_id)
        return AttributeType.objects.all()


class AdminProductListView(generics.ListAPIView):
    """Faqat admin: barcha e'lonlar (status va owner'dan qat'iy nazar)"""
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['status', 'category']
    search_fields = ['title', 'owner__username']


class AdminProductUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    """Faqat admin: statusni o'zgartirish (bloklash/tasdiqlash) yoki o'chirish"""
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer
    permission_classes = [permissions.IsAdminUser]
