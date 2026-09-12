from django.urls import path
from .views import FavoriteListCreateAPI, FavoriteDeleteAPI, FollowedSellerListCreateAPI, FollowedSellerDeleteAPI

urlpatterns = [
    path('', FavoriteListCreateAPI.as_view(), name='favorite-list-create'),
    path('delete/<int:pk>/', FavoriteDeleteAPI.as_view(), name='favorite-delete'),
    path('sellers/', FollowedSellerListCreateAPI.as_view(), name='followed-seller-list-create'),
    path('sellers/delete/<int:pk>/', FollowedSellerDeleteAPI.as_view(), name='followed-seller-delete'),
]