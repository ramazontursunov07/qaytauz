from django.urls import path
from .views import (CategoryListView,
                    CategoryCreateView,
                    CategoryUpdateDeleteView,
                    ProductListView,
                    ProductDetailView,
                    ProductCreateView,
                    MyProductListView,
                    ProductUpdateDeleteView, AttributeTypeListView, AdminProductListView, AdminProductUpdateDeleteView
                    )

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('category-create/', CategoryCreateView.as_view(), name='category-create'),
    path('category/<int:pk>/', CategoryUpdateDeleteView.as_view(), name='category-update-delete'),
    path('', ProductListView.as_view(), name='product-list'),
    path('create/', ProductCreateView.as_view(), name='product-create'),
    path('my/', MyProductListView.as_view(), name='my-products'),
    path('<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('<int:pk>/manage/', ProductUpdateDeleteView.as_view(), name='product-manage'),
    path('attribute-types/', AttributeTypeListView.as_view(), name='attribute-type-list'),
    path('admin/all/', AdminProductListView.as_view(), name='admin-product-list'),
    path('admin/<int:pk>/', AdminProductUpdateDeleteView.as_view(), name='admin-product-manage')
]
