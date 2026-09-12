import django_filters
from .models import Product


class ProductFilter(django_filters.FilterSet):
    price_max = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    price_min = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    # status=Arxiv maxsus qiymat sifatida "Faol bo'lmagan barcha holatlar"ni bildiradi
    # (Sotildi, Ko'rib chiqilmoqda, Bloklangan), sotuvchi profilidagi "Arxiv" bo'limi uchun.
    status = django_filters.CharFilter(method='filter_status')

    class Meta:
        model = Product
        fields = ['category', 'condition', 'region', 'free_delivery', 'price_max', 'price_min', 'owner']

    def filter_status(self, queryset, name, value):
        if value == 'Arxiv':
            return queryset.exclude(status=Product.ACTIVE)
        return queryset.filter(status=value)
