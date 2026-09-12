from rest_framework import generics, permissions
from .serializers import FavoriteSerializer
from .models import Favorite, FollowedSeller
from .serializers import FollowedSellerSerializer


class FavoriteListCreateAPI(generics.ListCreateAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)


class FavoriteDeleteAPI(generics.DestroyAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)


class FollowedSellerListCreateAPI(generics.ListCreateAPIView):
    serializer_class = FollowedSellerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FollowedSeller.objects.filter(user=self.request.user)


class FollowedSellerDeleteAPI(generics.DestroyAPIView):
    serializer_class = FollowedSellerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FollowedSeller.objects.filter(user=self.request.user)
